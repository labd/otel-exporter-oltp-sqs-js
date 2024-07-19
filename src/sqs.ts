import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import {
  CompressionAlgorithm,
  OTLPExporterBase,
  OTLPExporterError,
  OTLPExporterNodeConfigBase,
} from "@opentelemetry/otlp-exporter-base";
import { SQSConfig } from "./config";
import { ISerializer } from "@opentelemetry/otlp-transformer";
import { compressData } from "./utils";
import { diag } from "@opentelemetry/api";
import type * as http from 'http';
import type * as https from 'https';

export abstract class OTLPExporterBaseSQS<
  ExportItem,
  ServiceResponse,
> extends OTLPExporterBase<OTLPExporterNodeConfigBase, ExportItem> {
  private _serializer: ISerializer<ExportItem[], ServiceResponse>;

  private _sqsClient: SQSClient | undefined;

  private _sqsQueueURL: string | undefined;

  private _kind: "trace" | "metric";

  private _contentType: string

  DEFAULT_HEADERS: Record<string, string>;

  headers: Record<string, string>;

  agent: http.Agent | https.Agent | undefined;

  compression: CompressionAlgorithm;

  constructor(
    config: OTLPExporterNodeConfigBase & SQSConfig = {},
    kind: "trace" | "metric",
    serializer: ISerializer<ExportItem[], ServiceResponse>
  ) {
    super(config);

    this._sqsQueueURL =
      config.sqsQueueURL ?? process.env.OTEL_EXPORTER_OTLP_SQS_QUEUE_URL;
    if (this._sqsQueueURL) {
      this._sqsClient = new SQSClient();
    }
    this.compression = CompressionAlgorithm.GZIP;
    this._serializer = serializer;
    this._kind = kind;
  }

  getDefaultUrl(config: OTLPExporterNodeConfigBase): string {
    return "http://localhost:4317/v1/traces";
  }

  send(
    objects: ExportItem[],
    onSuccess: () => void,
    onError: (error: OTLPExporterError) => void
  ): void {
    if (this._shutdownOnce.isCalled) {
      diag.debug("Shutdown already started. Cannot send objects");
      return;
    }

    if (!this._sqsClient) {
      diag.error("SQS client not initialized");
      return;
    }

    const promise = new Promise<void>((resolve, reject) => {
      this.serializeItem(objects)
        .then((body) => {
          const command = new SendMessageCommand({
            QueueUrl: this._sqsQueueURL,
            MessageBody: body,
          });

          return this._sqsClient?.send(command);
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    }).then(onSuccess, onError);

    this._sendingPromises.push(promise);
    const popPromise = () => {
      const index = this._sendingPromises.indexOf(promise);
      this._sendingPromises.splice(index, 1);
    };

    promise.then(popPromise, popPromise);
  }

  async serializeItem(item: ExportItem[]): Promise<string> {
    const data = this._serializer.serializeRequest(item) ?? new Uint8Array();

    const compressedData = await compressData(data);
    return JSON.stringify({
      kind: this._kind,
      data: compressedData,
    });
  }

  onInit(config: OTLPExporterNodeConfigBase): void {}

  onShutdown(): void {
    // TODO: Flush all promises
    this._sqsClient?.destroy();
  }
}
