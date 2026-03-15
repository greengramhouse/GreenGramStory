// lib/dal.ts
import "server-only"; // บังคับให้ไฟล์นี้รันแค่ Server เท่านั้น
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";
import { decrypt } from "@/utils/session";

// ใช้ cache ของ React เพื่อทำ Request Memoization
export const getUser = cache(async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) return null;

  const session = await decrypt(sessionToken);

  if (!session?.userId) return null;

  try {
    const user = await prisma.users.findUnique({
      where: {
        id: Number(session.userId), // แปลงเป็น Int ตาม Prisma Schema
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // ❌ อย่าเลือก password มาเด็ดขาด
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
});

// ใช้สำหรับดึงแค่ Session (ไม่ต้อง Query Database) เพื่อความเร็วใน Layout/Navbar
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) return null;

  return await decrypt(sessionToken);
});