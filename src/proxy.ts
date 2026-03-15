import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from './utils/session'

// 1. กำหนด Routes
const protectedRoutes: string[] = []  // /blog เข้าได้โดยไม่ต้อง login — VIP lock จัดการที่ DTO แทน
const adminRoutes = ['/dashboard'] 

// 🛑 Auth Routes: คือหน้าที่จะ "ไม่ให้เข้า" ถ้า Login แล้ว (เช่น หน้า Login, Register)
const authRoutes = ['/login', '/register'] 

// ✅ Public Routes: คือหน้าเปิดสาธารณะ เข้าได้ทุกคน ไม่ว่าจะ Login หรือไม่ (เช่น หน้าแรก)
// ไม่ต้องใส่ใน middleware logic การ redirect ก็ได้ ปล่อยผ่านไปเลย

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  // --------------------------------------------------------
  // A. ป้องกัน Admin Routes
  // --------------------------------------------------------
  const isAdminPath = adminRoutes.some((route) => path.startsWith(route))
  if (isAdminPath) {
    if (!session?.userId) return NextResponse.redirect(new URL('/login', req.nextUrl))
    if (session.role !== 'admin') return NextResponse.redirect(new URL('/blog', req.nextUrl))
  }

  // --------------------------------------------------------
  // B. ป้องกัน Protected Routes (User ทั่วไป)
  // --------------------------------------------------------
  const isProtectedPath = protectedRoutes.some((route) => path.startsWith(route))
  if (isProtectedPath && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // --------------------------------------------------------
  // C. จัดการ Auth Routes (Login/Register)
  // --------------------------------------------------------
  // ถ้า Login แล้ว แต่พยายามเข้าหน้า Login/Register -> ดีดไปหน้าบ้าน
  const isAuthPath = authRoutes.includes(path)
  
  if (isAuthPath && session?.userId) {
    if (session.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    } else {
      return NextResponse.redirect(new URL('/blog', req.nextUrl))
    }
  }

  // --------------------------------------------------------
  // D. หน้าแรก (Root /) และหน้าอื่นๆ
  // --------------------------------------------------------
  // ปล่อยผ่านเลย! ให้ HomePage.tsx ไปจัดการแสดงปุ่มเอาเอง
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}