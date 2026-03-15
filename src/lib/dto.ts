import "server-only";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

// ... (ฟังก์ชัน getBlogListDTO ของเดิม) ...
export async function getBlogListDTO() {
  const user = await getUser();
  const isPrivilegedUser = user && (['admin', 'vip'].includes(user.role));

  const blogs = await prisma.post.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      content: true,
      thumbnail: true,
      isVipOnly: true,
      createdAt: true,
      users: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  return blogs.map((blog) => {
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
  });
}

// ✅ เพิ่มฟังก์ชันนี้สำหรับดึงบทความเดียว
export async function getBlogPostDTO(id: string) {
  const user = await getUser();
  const isPrivilegedUser = user && (['admin', 'vip'].includes(user.role));

  const blog = await prisma.post.findUnique({
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
  });

  if (!blog) return null;

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