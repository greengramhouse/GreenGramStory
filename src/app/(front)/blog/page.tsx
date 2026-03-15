
import { getBlogListDTO } from "@/lib/dto";
import { stripHtml } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

// นี่คือ Server Component (default ใน App Router)
export default async function BlogPage() {
  // 1. เรียกใช้ DTO โดยตรง (ทำงานฝั่ง Server เท่านั้น)
  const blogs = await getBlogListDTO();
  // console.log(blogs)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">บทความทั้งหมด</h1>
        <p className="text-gray-600">แหล่งรวมความรู้สำหรับสมาชิกของเรา</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
            
            {/* ส่วนรูปภาพ Thumbnail */}
            <div className="relative h-48 w-full bg-gray-100">
              {blog.thumbnail ? (
                <Image 
                  src={blog.thumbnail} 
                  alt={blog.title} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span className="text-sm">No Image</span>
                </div>
              )}
              
              {/* Badge แสดงสถานะ VIP */}
              {blog.isVipOnly && (
                <div className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <span>★ VIP</span>
                </div>
              )}
            </div>

            {/* ส่วนเนื้อหาในการ์ด */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>{blog.authorName}</span>
                <span>•</span>
                <span>{new Date(blog.createdAt).toLocaleDateString('th-TH')}</span>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                {blog.title}
              </h2>

              <div className="flex-1">
                {/* ตรวจสอบว่าถูกล็อคหรือไม่ (isLocked มาจาก DTO) */}
                {blog.isLocked ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center flex flex-col items-center justify-center h-full min-h-[100px]">
                    <span className="text-2xl mb-2">🔒</span>
                    <p className="text-sm text-gray-500 font-medium">เนื้อหานี้สำหรับสมาชิก VIP</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <div className="h-3 w-full bg-gray-50 rounded animate-pulse opacity-50"></div>
                    <div className="h-3 w-5/6 bg-gray-50 rounded animate-pulse opacity-50"></div>
                    <div className="h-3 w-4/6 bg-gray-50 rounded animate-pulse opacity-50"></div>
                  </div>
                )}
              </div>

              {/* ปุ่ม Action */}
              <div className="mt-6 pt-4 border-t">
                {blog.isLocked ? (
                  <Link 
                    href="/login?callbackUrl=/blog"
                    className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                  >
                    🔓 เข้าสู่ระบบเพื่ออ่าน VIP
                  </Link>
                ) : (
                  <Link 
                    href={`/blog/${blog.id}`} 
                    className="block w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-semibold py-2 transition-colors"
                  >
                    อ่านเพิ่มเติม &rarr;
                  </Link>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
      
      {blogs.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          ยังไม่มีบทความในขณะนี้
        </div>
      )}
    </div>
  );
}