import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// 延迟实例化：不在模块加载时连接，仅在 USE_MOCK=false 时按需创建
let _prisma: PrismaClient | undefined;
export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = _prisma;
    }
  }
  return _prisma;
}

// 兼容直接 import { prisma } 的写法（首次访问时触发延迟实例化）
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop];
  },
});
