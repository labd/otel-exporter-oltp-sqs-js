# OpenTelemetry SQS Exporter
An OpenTelemetry exporter for traces and metrics that pushes them to an SQS
queue. This is useful when running in a serverless environment. The
[exporter-oltp-sqs-consumer](https://github.com/labd/exporter-oltp-sqs-consumer)
can be used to consume the traces and metrics from the SQS queue and push them
to a collector.

## Usage
```sh
pnpm add @labdigital/exporter-oltp-sqs
```

Set the `OTEL_EXPORTER_OTLP_SQS_QUEUE_URL` env var to the SQS query to push the traces and metrics to.

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
const metricExporter = new OTLPMetricExporterSQS({
  // Optional if no env var is set
  sqsQueueURL: "https://sqs.eu-west-1.amazonaws.com/xxxx/honeycomb-refinery-exporter.fifo",
});

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
