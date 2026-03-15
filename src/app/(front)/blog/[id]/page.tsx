import { getBlogPostDTO } from "@/lib/dto";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  // 1. ดึงข้อมูลบทความ
  const blog = await getBlogPostDTO(id);

  // 2. ถ้าไม่เจอบทความ ให้แสดงหน้า 404
  if (!blog) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* ปุ่มย้อนกลับ */}
      <Link 
        href="/blog" 
        className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
      >
        ← กลับไปหน้ารวมบทความ
      </Link>

      {/* Header รูปภาพ */}
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-sm mb-8 bg-gray-100">
        {blog.thumbnail ? (
          <Image
            src={blog.thumbnail}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-lg">No Cover Image</span>
          </div>
        )}
        
        {/* VIP Badge */}
        {blog.isVipOnly && (
          <div className="absolute top-4 right-4 bg-amber-400 text-white font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <span>★ VIP Content</span>
          </div>
        )}
      </div>

      {/* หัวข้อและ Meta Data */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {blog.title}
        </h1>
        <div className="flex items-center gap-4 text-gray-500 text-sm md:text-base border-b pb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {blog.authorName.charAt(0).toUpperCase()}
            </div>
            <span>{blog.authorName}</span>
          </div>
          <span>•</span>
          <time>{new Date(blog.createdAt).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</time>
        </div>
      </header>

      {/* เนื้อหาบทความ */}
      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        {blog.isLocked ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center mt-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              เนื้อหานี้สงวนสิทธิ์สำหรับสมาชิก VIP
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              กรุณาเข้าสู่ระบบด้วยบัญชี VIP หรือสมัครสมาชิกเพื่อเข้าถึงบทความเชิงลึกและเทคนิคพิเศษนี้
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/pricing"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                สมัครสมาชิก VIP
              </Link>
              <Link
                href="/login"
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold px-8 py-3 rounded-xl transition-all"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        ) : (
          /* เปลี่ยนจากการ render ตรงๆ มาใช้ dangerouslySetInnerHTML 
             เพื่อให้ React ทำการแปลง HTML String ให้กลายเป็น UI ของจริง
          */
          <div 
            className="ql-content max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content || "" }} 
          />
        )}
      </div>
    </article>
  );
}