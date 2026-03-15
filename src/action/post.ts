"use server";

import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import crypto from "crypto";

// Schema สำหรับ Validate ข้อมูลฝั่ง Server
const postSchema = z.object({
  title: z.string().min(3, "หัวข้อต้องยาวกว่า 3 ตัวอักษร"),
  content: z.string().min(10, "เนื้อหาต้องยาวกว่า 10 ตัวอักษร"),
  thumbnail: z.string().optional(),
});

// Type สำหรับ State ของ Form
export type PostFormState = {
  success: boolean;
  message?: string;
  errors?: {
    title?: string[];
    content?: string[];
  };
  inputs?: {
    title: string;
    content: string;
    thumbnail: string;
    isVipOnly: boolean;
    published: boolean;
  };
};

export async function createPostAction(
  prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  // 1. ตรวจสอบผู้ใช้ (ต้อง Login ก่อน)
  const user = await getUser();
  if (!user) {
    return { success: false, message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" };
  }

  // 2. ดึงข้อมูลจาก Form
  const rawData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    thumbnail: formData.get("thumbnail") as string,
    isVipOnly: formData.get("isVipOnly") === "on", // Checkbox ถ้าติ๊กจะส่งค่า "on"
    published: formData.get("published") === "on",
  };

  // 3. Validate ข้อมูล
  const validated = postSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
      errors: validated.error.flatten().fieldErrors,
      inputs: rawData,
    };
  }

  try {
    // 4. บันทึกลง Database
    await prisma.post.create({
      data: {
        id: crypto.randomUUID(), // สร้าง ID แบบ UUID
        title: rawData.title,
        content: rawData.content,
        thumbnail: rawData.thumbnail || null,
        isVipOnly: rawData.isVipOnly,
        published: rawData.published,
        authorId: user.id, // ผูกกับ User ที่ Login อยู่
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      inputs: rawData,
    };
  }

  // 5. เคลียร์ Cache และ return success (client จะ redirect เอง)
  revalidatePath("/blog");
  revalidatePath("/dashboard/posts");
  return { success: true, message: "บันทึกบทความเรียบร้อยแล้ว" };
}

// ============================================================
// POST MANAGEMENT (Dashboard CRUD)
// ============================================================

const POST_PAGE_SIZE = 10;

export type PostListResult = {
  posts: {
    id: string;
    title: string;
    content: string;
    thumbnail: string | null;
    isVipOnly: boolean;
    published: boolean;
    createdAt: Date;
    authorName: string;
  }[];
  total: number;
  page: number;
  totalPages: number;
};

export type PostAdminFormState = {
  success: boolean;
  message?: string;
  errors?: {
    title?: string[];
    content?: string[];
  };
};

/** ดึง list posts พร้อม search + pagination */
export async function getPostsAction(
  page: number = 1,
  search: string = ""
): Promise<PostListResult> {
  const where = search
    ? { title: { contains: search } }
    : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        thumbnail: true,
        isVipOnly: true,
        published: true,
        createdAt: true,
        users: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * POST_PAGE_SIZE,
      take: POST_PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      thumbnail: p.thumbnail,
      isVipOnly: p.isVipOnly,
      published: p.published,
      createdAt: p.createdAt,
      authorName: p.users?.name ?? "Unknown",
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / POST_PAGE_SIZE)),
  };
}

/** แก้ไข Post */
export async function updatePostAction(
  id: string,
  prevState: PostAdminFormState,
  formData: FormData
): Promise<PostAdminFormState> {
  const rawData = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    thumbnail: (formData.get("thumbnail") as string) || undefined,
    isVipOnly: formData.get("isVipOnly") === "on",
    published: formData.get("published") === "on",
  };

  const validated = postSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "ข้อมูลไม่ถูกต้อง",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.post.update({
      where: { id },
      data: {
        title: rawData.title,
        content: rawData.content,
        thumbnail: rawData.thumbnail ?? null,
        isVipOnly: rawData.isVipOnly,
        published: rawData.published,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    return { success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }

  revalidatePath("/blog");
  revalidatePath("/dashboard/posts");
  return { success: true, message: "แก้ไขบทความสำเร็จ" };
}

/** ลบ Post */
// ฟังก์ชันช่วยเหลือสำหรับดึง public_id จาก Cloudinary URL
function extractPublicId(url: string) {
  try {
    // URL ของ Cloudinary มักจะมีโครงสร้าง .../image/upload/v1234567/folder/filename.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    let path = parts[1];
    
    // เอา version tag ออก (รูปแบบ v ตามด้วยตัวเลข เช่น v1712345678/)
    if (path.match(/^v\d+\//)) {
      path = path.replace(/^v\d+\//, '');
    }
    
    // ตัดส่วนนามสกุลไฟล์ออก (.jpg, .png, ฯลฯ)
    const publicId = path.substring(0, path.lastIndexOf('.'));
    return publicId || path;
  } catch {
    return null;
  }
}

// ฟังก์ชันสำหรับส่ง Request ลบรูปไปยัง Cloudinary
async function deleteCloudinaryImage(url: string) {
  const publicId = extractPublicId(url);
  if (!publicId) return false;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return false;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // สร้าง Signature สำหรับ API destroy 
  // String to sign ต้องเรียง parameter ตามตัวอักษร (public_id -> timestamp)
  const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha256").update(strToSign).digest("hex");

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp);
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: "POST", body: formData }
    );
    
    return res.ok;
  } catch (err) {
    console.error("Failed to delete image from Cloudinary:", err);
    return false;
  }
}

/** ลบ Post และรููปภาพ */
export async function deletePostAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. ดึงข้อมูล Post ออกมาก่อนเพื่อเอา URL ของ Thumbnail
    const post = await prisma.post.findUnique({
      where: { id },
      select: { thumbnail: true }
    });

    // 2. ถ้ามี thumbnail ให้พยายามลบรูปจาก Cloudinary ก่อน
    if (post?.thumbnail) {
      await deleteCloudinaryImage(post.thumbnail);
    }

    // 3. ลบข้อมูลออกจาก Database
    await prisma.post.delete({ where: { id } });
    
    // 4. สั่ง Revalidate หน้าเพื่ออัปเดต UI
    revalidatePath("/blog");
    revalidatePath("/dashboard/posts");
    
    return { success: true, message: "ลบบทความและรูปภาพสำเร็จ" };
  } catch (error) {
    return { success: false, message: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}
