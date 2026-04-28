import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Check if DATABASE_URL is configured
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not configured');
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
