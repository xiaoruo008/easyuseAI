import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Vercel/Neon/Supabase serverless：连接池由 DATABASE_URL 参数控制
// Neon/Supabase 的连接串已自带 connection_limit，无需在这里覆盖
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
