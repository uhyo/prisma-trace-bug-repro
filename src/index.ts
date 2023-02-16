import {
  AlwaysOnSampler,
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { PrismaInstrumentation } from "@prisma/instrumentation";

registerInstrumentations({
  instrumentations: [new PrismaInstrumentation()],
});

const provider = new BasicTracerProvider({
  sampler: new AlwaysOnSampler(),
});

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register({});

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
