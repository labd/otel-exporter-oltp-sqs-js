import { OTLPExporterNodeConfigBase } from "@opentelemetry/otlp-exporter-base";
import {
  IExportTraceServiceResponse,
  JsonTraceSerializer,
} from "@opentelemetry/otlp-transformer";
import { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import { SQSConfig } from "./config";
import { OTLPExporterBaseSQS } from "./sqs";

export class OTLPTraceExporterSQS
  extends OTLPExporterBaseSQS<ReadableSpan, IExportTraceServiceResponse>
  implements SpanExporter
{
  constructor(config: OTLPExporterNodeConfigBase & SQSConfig = {}) {
    super(config, "trace", JsonTraceSerializer);
  }

  getDefaultUrl(config: OTLPExporterNodeConfigBase): string {
    return "http://localhost:4317/v1/traces";
  }
}
