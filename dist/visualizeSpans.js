"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualizeSpans = void 0;
const api_1 = require("@opentelemetry/api");
function visualizeSpans(exporter) {
    // traceId -> spanId -> ReadableSpan
    const map = new Map();
    let spans = exporter.getFinishedSpans();
    let next = [];
    while (spans.length > 0) {
        for (const span of spans) {
            const { traceId, spanId } = span.spanContext();
            // console.log({ traceId, spanId, parentSpanId: span.parentSpanId });
            let traceMap = map.get(traceId);
            if (traceMap === undefined) {
                map.set(traceId, (traceMap = new Map()));
            }
            if (span.parentSpanId === undefined ||
                span.parentSpanId === api_1.INVALID_SPANID) {
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
            if (span.parentSpanId === undefined ||
                span.parentSpanId === api_1.INVALID_SPANID) {
                renderSpan(span);
            }
        }
    }
    function renderSpan(span, indent = "") {
        console.log(`${indent}${span.name} (${span.spanContext().spanId})`);
        for (const childSpan of span.children ?? []) {
            renderSpan(childSpan, indent + "  ");
        }
    }
}
exports.visualizeSpans = visualizeSpans;
