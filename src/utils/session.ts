import "server-only";
import { SignJWT, jwtVerify, JWTPayload } from "jose"; // import JWTPayload เพิ่ม
import { cookies } from "next/headers";

// ป้องกันกรณีลืมตั้งค่าใน .env
const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET is not set in environment variables");
}
const encodedKey = new TextEncoder().encode(secretKey);

// 1. Payload ของ Session (User + Role)
// extend JWTPayload เพื่อให้ Type เข้ากันได้กับ jose
type SessionPayload = {
  userId: string;
  role: string;
  expiresAt: Date;
} & JWTPayload;

// 2. ฟังก์ชันเข้ารหัสข้อมูล (สร้าง Token)
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // อายุ Token (Claim 'exp' มาตรฐาน)
    .sign(encodedKey);
}

// 3. ฟังก์ชันถอดรหัสข้อมูล (ตรวจสอบ Token)
export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    // ⭐️ สำคัญ: Cast Type กลับไปเป็น SessionPayload
    // เพื่อให้ไฟล์อื่นรู้ว่ามี .role, .userId
    return payload as SessionPayload; 
  } catch (error) {
    // console.log("Failed to verify session");
    return null;
  }
}

// 4. ฟังก์ชันสร้าง Session (Login สำเร็จ -> ยัด Cookie)
export async function createSession(userId: string, role: string = "USER") {
  // คำนวณวันหมดอายุ
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
  
  // สร้าง Token
  const session = await encrypt({ userId, role, expiresAt });
  
  // ยัด Cookie
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

// 5. ฟังก์ชันลบ Session (Logout)
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}