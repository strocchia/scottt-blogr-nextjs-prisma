import { PrismaClient } from "@prisma/client";

// Docs about instantiating `PrismaClient` with Next.js:
// https://pris.ly/d/help/next-js-best-practices

declare global {
  var prismaG: PrismaClient
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prismaG) {
    global.prismaG = new PrismaClient();
  }

  prisma = global.prismaG;
}

prisma = new PrismaClient();

export default prisma;
