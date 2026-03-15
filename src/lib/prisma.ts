// import "dotenv/config";
// import { PrismaMariaDb } from '@prisma/adapter-mariadb';
// import { PrismaClient } from '../../generated/prisma/client';

// const adapter = new PrismaMariaDb({
//   host: process.env.DATABASE_HOST,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE_NAME,
//   connectionLimit: 5
// });
// const prisma = new PrismaClient({ adapter });

// export { prisma }

// ลบ import "dotenv/config"; ออกได้เลยครับ เพราะ Next.js จะโหลด .env ให้อัตโนมัติอยู่แล้ว
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client'; // 👈 แก้บรรทัดนี้ให้ดึงจาก @prisma/client

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5
});

// แนะนำให้ใช้ Global object ใน Next.js เพื่อป้องกันปัญหา Connection เต็มเวลา Hot Reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;