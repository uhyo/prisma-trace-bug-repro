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
import { suppressTracing } from "@opentelemetry/core";
import { visualizeSpans } from "./visualizeSpans";

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

const tracer = trace.getTracerProvider().getTracer("default");

async function main() {
  await tracer.startActiveSpan("main-outer", async (span) => {
    try {
      await context.with(suppressTracing(context.active()), async () => {
        await tracer.startActiveSpan("main-inner", async (span) => {
          try {
            const prisma = new PrismaClient();
            const count = await prisma.user.count();
            console.log({ count });
            await prisma.$disconnect();
          } finally {
            span.end();
          }
        });
      });
    } finally {
      span.end();
    }
  });
}

main()
  .then(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    visualizeSpans(exporter);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
