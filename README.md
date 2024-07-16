# OTEL SQS Exporter


## Usage
```ts
import {
	OTLPMetricExporter as OTLPMetricExporterSQS,
	OTLPTraceExporter as OTLPTraceExporterSQS,
} from "@labdigital/exporter-oltp-sqs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import type { NodeSDKConfiguration } from "@opentelemetry/sdk-node";
import { NodeSDK } from "@opentelemetry/sdk-node";

const traceExporter = new OTLPTraceExporterSQS();
const metricExporter = new OTLPMetricExporterSQS();

const config: Partial<NodeSDKConfiguration> = {
  traceExporter: traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 5000,
  }),
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
};

const sdk = new NodeSDK(config);
sdk.start();
```
