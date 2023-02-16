import {
  InMemorySpanExporter,
  ReadableSpan,
} from "@opentelemetry/sdk-trace-base";

type ReadableSpanTree = ReadableSpan & {
  children?: ReadableSpanTree[];
};

export function visualizeSpans(exporter: InMemorySpanExporter): void {
  // traceId -> spanId -> ReadableSpan
  const map = new Map<string, Map<string, ReadableSpanTree>>();

  let spans = exporter.getFinishedSpans();
  let next = [];
  while (spans.length > 0) {
    for (const span of spans) {
      const { traceId, spanId } = span.spanContext();
      let traceMap = map.get(traceId);
      if (traceMap === undefined) {
        map.set(traceId, (traceMap = new Map()));
      }

      if (span.parentSpanId === undefined) {
        traceMap.set(spanId, span);
        continue;
      }

      const parentSpan = traceMap.get(span.parentSpanId);
      if (parentSpan === undefined) {
        next.push(span);
        continue;
      }

      parentSpan.children ??= [];
      parentSpan.children.push(span);
      traceMap.set(spanId, span);
    }

    spans = next;
    next = [];
  }

  console.log("Below are visualization of traced spans:");

  for (const [traceId, traceMap] of map) {
    console.log("----- traceId =", traceId, "-----");
    for (const span of traceMap.values()) {
      if (span.parentSpanId === undefined) {
        renderSpan(span);
      }
    }
  }

  function renderSpan(span: ReadableSpanTree, indent: string = "") {
    console.log(`${indent}${span.name} (${span.spanContext().spanId})`);
    for (const childSpan of span.children ?? []) {
      renderSpan(childSpan, indent + "  ");
    }
  }
}
