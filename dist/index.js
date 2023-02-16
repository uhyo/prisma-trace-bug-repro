"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@opentelemetry/api");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const context_async_hooks_1 = require("@opentelemetry/context-async-hooks");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const instrumentation_2 = require("@prisma/instrumentation");
const core_1 = require("@opentelemetry/core");
const visualizeSpans_1 = require("./visualizeSpans");
api_1.context.setGlobalContextManager(new context_async_hooks_1.AsyncLocalStorageContextManager().enable());
(0, instrumentation_1.registerInstrumentations)({
    instrumentations: [new instrumentation_2.PrismaInstrumentation()],
});
const provider = new sdk_trace_base_1.BasicTracerProvider({
    sampler: new sdk_trace_base_1.AlwaysOnSampler(),
});
const exporter = new sdk_trace_base_1.InMemorySpanExporter();
provider.addSpanProcessor(new sdk_trace_base_1.SimpleSpanProcessor(exporter));
provider.register({});
const client_1 = require("@prisma/client");
const tracer = api_1.trace.getTracerProvider().getTracer("default");
async function main() {
    await tracer.startActiveSpan("main-outer", async (span) => {
        try {
            await api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), async () => {
                await tracer.startActiveSpan("main-inner", async (span) => {
                    try {
                        const prisma = new client_1.PrismaClient();
                        const count = await prisma.user.count();
                        console.log({ count });
                        await prisma.$disconnect();
                    }
                    finally {
                        span.end();
                    }
                });
            });
        }
        finally {
            span.end();
        }
    });
}
main()
    .then(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    (0, visualizeSpans_1.visualizeSpans)(exporter);
})
    .catch(async (e) => {
    console.error(e);
    process.exit(1);
});
