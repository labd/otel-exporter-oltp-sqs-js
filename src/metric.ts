import { OTLPExporterNodeConfigBase } from "@opentelemetry/otlp-exporter-base";
import { SQSConfig } from "./config";
import { OTLPExporterBaseSQS } from "./sqs";
import {
  OTLPMetricExporterBase,
  OTLPMetricExporterOptions,
} from "@opentelemetry/exporter-metrics-otlp-http";
import {
  IExportMetricsServiceResponse,
  JsonMetricsSerializer,
} from "@opentelemetry/otlp-transformer";
import { ResourceMetrics } from "@opentelemetry/sdk-metrics";

class OTLPExporterProxy extends OTLPExporterBaseSQS<
  ResourceMetrics,
  IExportMetricsServiceResponse
> {
  constructor(config: OTLPExporterNodeConfigBase & SQSConfig = {}) {
    super(config, "metric", JsonMetricsSerializer);
  }

  getDefaultUrl(config: OTLPExporterNodeConfigBase): string {
    return "http://localhost:4317/v1/metrics";
  }
}

export class OTLPMetricExporterSQS extends OTLPMetricExporterBase<OTLPExporterProxy> {
  constructor(config?: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions) {
    super(new OTLPExporterProxy(config), config);
  }
}
