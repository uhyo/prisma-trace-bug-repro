"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const instrumentation_2 = require("@prisma/instrumentation");
(0, instrumentation_1.registerInstrumentations)({
    instrumentations: [new instrumentation_2.PrismaInstrumentation()],
});
const provider = new sdk_trace_base_1.BasicTracerProvider({
    sampler: new sdk_trace_base_1.AlwaysOnSampler(),
});
provider.addSpanProcessor(new sdk_trace_base_1.SimpleSpanProcessor(new sdk_trace_base_1.ConsoleSpanExporter()));
provider.register({});
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // ... you will write your Prisma Client queries here
}
main()
    .then(async () => {
    const count = await prisma.user.count();
    console.log({ count });
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
