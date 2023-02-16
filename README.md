A reproduction of a Prisma bug https://github.com/prisma/prisma/issues/17953.

## Reproduction steps

1. `npm install`
2. `npx prisma migrate dev`
3. `npx tsc`
4. `node dist/index.js`