"use server";

import bcrypt from "bcryptjs"; // ต้องลงเพิ่ม: npm i bcryptjs และ npm i -D @types/bcryptjs
import { prisma } from "@/lib/prisma";
import {
  loginUserSchema,
  registerUserSchema,
  zodValidateData,
} from "@/utils/zodValidateData";
import z from "zod";
import { createSession } from "@/utils/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers"; // เพิ่ม import cookies


// 2. สร้าง Type สำหรับ Return State ของ Action นี้
export type RegisterState = {
  success: boolean;
  error?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    form?: string[]; // สำหรับ Error ทั่วไป เช่น DB ล่ม
  };
  inputs: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  data?: { name?: string; email?: string };
};

// 3. ระบุ Type ในฟังก์ชัน (แก้ state: any เป็น prevState: RegisterState)
export const registerUser = async (
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> => {
  // 1. ดึงข้อมูลและ Validate ด้วย Zod (ทำเหมือนเดิม)
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validated = zodValidateData(registerUserSchema, {
    name,
    email,
    password,
    confirmPassword,
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.errors,
      inputs: { name, email, password, confirmPassword },
    };
  }

  try {
    // 2. ตรวจสอบว่ามี Email นี้ในระบบหรือยัง
    const existingUser = await prisma.users.findUnique({
      where: { email }, // Prisma ต้องระบุ where clause ให้ชัดเจน
    });

    if (existingUser) {
      return {
        success: false,
        error: { email: ["อีเมลนี้ถูกใช้งานไปแล้ว"] },
        inputs: { name, email, password, confirmPassword },
      };
    }

    // 3. Hash รหัสผ่านก่อนบันทึก (ห้ามเก็บรหัสผ่านตัวเต็มลง DB เด็ดขาด!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. บันทึกข้อมูลลง Database
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log(newUser);

    return {
      success: true,
      data: { name, email },
      inputs: { name: "", email: "", password: "", confirmPassword: "" },
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      error: { form: ["เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล"] },
      inputs: { name, email, password, confirmPassword },
    };
  }
};

// 2. สร้าง Type สำหรับ Return State ของ Action นี้
export type LoginState = {
  success: boolean;
  error?: {
    email?: string[];
    password?: string[];
    form?: string[]; // สำหรับ Error ทั่วไป เช่น DB ล่ม
  };
  inputs: {
    email?: string;
    password?: string;
  };
};

export const loginUser = async (
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  console.log(formData);

  const validated = zodValidateData(loginUserSchema, {
    email,
    password,
  });

  // check validate form
  if (!validated.success) {
    return {
      success: false,
      error: validated.errors,
      inputs: { email, password },
    };
  }

  // chek user existence
  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      error: { email: ["อีเมลนี้ยังไม่ลงทะเบียน"] },
      inputs: { email, password },
    };
  }

  // check Password in db
  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log(passwordMatch);
  if (!passwordMatch) {
    return {
      success: false,
      error: { form: ["อีเมลล์ หรือ รหัสผ่านไม่ถูกต้อง"] },
      inputs: { email, password },
    };
  }

  // create session
  await createSession(user.id.toString(), user.role);

  // redirect page
  const callbackUrl = formData.get("callbackUrl") as string | null;
  if (user.role === "admin") {
    redirect("/dashboard");
  } else {
    redirect(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/blog");
  }


};


// เพิ่ม action สำหรับ Logout
export const logoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
};

// ============================================================
// USER MANAGEMENT (Admin CRUD)
// ============================================================

const PAGE_SIZE = 10;

export type UserListResult = {
  users: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user" | "vip";
    created_at: Date | null;
  }[];
  total: number;
  page: number;
  totalPages: number;
};

/** ดึง list ผู้ใช้งาน พร้อม search + pagination */
export async function getUsersAction(
  page: number = 1,
  search: string = ""
): Promise<UserListResult> {
  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, created_at: true },
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.users.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export type AdminUserFormState = {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
  };
};

const adminUserSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  role: z.enum(["admin", "user", "vip"]),
  password: z.string().optional(),
});

/** สร้าง user ใหม่โดย admin */
export async function createUserAdminAction(
  prevState: AdminUserFormState,
  formData: FormData
): Promise<AdminUserFormState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as "admin" | "user",
    password: formData.get("password") as string,
  };

  const validated = adminUserSchema
    .extend({ password: z.string().min(6, "รหัสผ่านต้องยาวกว่า 6 ตัวอักษร") })
    .safeParse(raw);

  if (!validated.success) {
    return { success: false, message: "ข้อมูลไม่ถูกต้อง", errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.users.findUnique({ where: { email: raw.email } });
  if (existing) {
    return { success: false, message: "อีเมลนี้ถูกใช้งานแล้ว", errors: { email: ["อีเมลนี้ถูกใช้งานแล้ว"] } };
  }

  const hashedPassword = await bcrypt.hash(raw.password!, 10);
  await prisma.users.create({
    data: { name: raw.name, email: raw.email, role: raw.role, password: hashedPassword },
  });

  revalidatePath("/dashboard/users");
  return { success: true, message: "สร้างผู้ใช้งานสำเร็จ" };
}

/** แก้ไขข้อมูล user */
export async function updateUserAction(
  id: number,
  prevState: AdminUserFormState,
  formData: FormData
): Promise<AdminUserFormState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as "admin" | "user",
    password: formData.get("password") as string,
  };

  const validated = adminUserSchema.safeParse(raw);
  if (!validated.success) {
    return { success: false, message: "ข้อมูลไม่ถูกต้อง", errors: validated.error.flatten().fieldErrors };
  }

  // Check email collision with another user
  const existing = await prisma.users.findUnique({ where: { email: raw.email } });
  if (existing && existing.id !== id) {
    return { success: false, message: "อีเมลนี้ถูกใช้งานแล้ว", errors: { email: ["อีเมลนี้ถูกใช้งานแล้ว"] } };
  }

  const updateData: { name: string; email: string; role: "admin" | "user"; password?: string } = {
    name: raw.name,
    email: raw.email,
    role: raw.role,
  };

  if (raw.password && raw.password.length >= 6) {
    updateData.password = await bcrypt.hash(raw.password, 10);
  }

  await prisma.users.update({ where: { id }, data: updateData });
  revalidatePath("/dashboard/users");
  return { success: true, message: "แก้ไขข้อมูลสำเร็จ" };
}

/** ลบ user */
export async function deleteUserAction(id: number): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.users.delete({ where: { id } });
    revalidatePath("/dashboard/users");
    return { success: true, message: "ลบผู้ใช้งานสำเร็จ" };
  } catch {
    return { success: false, message: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}