import "server-only";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

// ... (ฟังก์ชัน getBlogListDTO ของเดิม) ...
export async function getBlogListDTO() {
  const [user, blogs] = await Promise.all([
    getUser(),
    prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        // content: true, // 🚀 ไม่ดึงเนื้อหาเต็มเพื่อความเร็ว
        thumbnail: true,
        isVipOnly: true,
        createdAt: true,
        users: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const isPrivilegedUser = user && (['admin', 'vip'].includes(user.role));

  return blogs.map((blog) => {
    // ในหน้า List เราไม่เอา content ไปแสดงผล (หรืออาจจะเอาไปแค่ snippet สั้นๆ)
    // แต่เพื่อความเร็วสูงสุด เราจะเช็คแค่ lock status
    const canViewContent = !blog.isVipOnly || isPrivilegedUser;
    return {
      id: blog.id,
      title: blog.title,
      thumbnail: blog.thumbnail,
      authorName: blog.users?.name || 'Unknown',
      createdAt: blog.createdAt,
      isVipOnly: blog.isVipOnly,
      content: null, // 🚀 ปิดไว้สำหรับหน้า List
      isLocked: !canViewContent 
    };
  });
}

// ✅ เพิ่มฟังก์ชันนี้สำหรับดึงบทความเดียว
export async function getBlogPostDTO(id: string) {
  const [user, blog] = await Promise.all([
    getUser(),
    prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        thumbnail: true,
        isVipOnly: true,
        createdAt: true,
        users: { select: { name: true } },
      },
    })
  ]);

  if (!blog) return null;

  const isPrivilegedUser = user && (['admin', 'vip'].includes(user.role));

  const canViewContent = !blog.isVipOnly || isPrivilegedUser;

  return {
    id: blog.id,
    title: blog.title,
    thumbnail: blog.thumbnail,
    authorName: blog.users?.name || 'Unknown',
    createdAt: blog.createdAt,
    isVipOnly: blog.isVipOnly,
    content: canViewContent ? blog.content : null,
    isLocked: !canViewContent
  };
}