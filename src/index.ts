import { context, trace } from "@opentelemetry/api";
import {
  AlwaysOnSampler,
  BasicTracerProvider,
  ConsoleSpanExporter,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { PrismaInstrumentation } from "@prisma/instrumentation";

context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());

registerInstrumentations({
  instrumentations: [new PrismaInstrumentation()],
});

const provider = new BasicTracerProvider({
  sampler: new AlwaysOnSampler(),
});

const exporter = new InMemorySpanExporter();

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register({});

import { PrismaClient } from "@prisma/client";
import { visualizeSpans } from "./visualizeSpans";

const prisma = new PrismaClient();

const tracer = trace.getTracerProvider().getTracer("default");

async function main() {
  tracer.startActiveSpan("main", async (span) => {
    try {
      const count = await prisma.user.count();
      console.log({ count });
    } finally {
      span.end();
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await new Promise((resolve) => setTimeout(resolve, 100));
    visualizeSpans(exporter);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
