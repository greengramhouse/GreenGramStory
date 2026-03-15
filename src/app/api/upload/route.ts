// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }

    // ตรวจสอบขนาดไฟล์ (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "ขนาดไฟล์ต้องไม่เกิน 5MB" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary ยังไม่ได้ตั้งค่า" }, { status: 500 });
    }

    // สร้าง Signature สำหรับ Signed Upload
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "mylern";

    // String to sign ต้องเรียงตาม alphabet
    const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha256").update(strToSign).digest("hex");

    // ส่งไปยัง Cloudinary ด้วย Signed Upload
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("folder", folder);
    cloudinaryForm.append("timestamp", timestamp);
    cloudinaryForm.append("api_key", apiKey);
    cloudinaryForm.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: cloudinaryForm }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("Cloudinary error:", err);
      return NextResponse.json({ error: "อัพโหลดไม่สำเร็จ" }, { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json({
      url: data.secure_url,
      publicId: data.public_id,
    });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
