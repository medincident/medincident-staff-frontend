// lib/db.ts
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Если в глобальной переменной уже есть экземпляр — берем его,
// если нет — создаем новый.
export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

// В режиме разработки (не продакшн) сохраняем экземпляр в глобальную переменную,
// чтобы при Hot Reload не создавались новые подключения.
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db;
}
