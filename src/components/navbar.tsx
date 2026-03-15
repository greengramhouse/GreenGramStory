import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { getSession } from "@/lib/dal"; // ดึงเฉพาะ Session (ไม่ยิง DB เพิ่อความเร็ว)
import Link from "next/link";
import { logoutAction } from "@/action/user";

const Navbar = async () => {
  // 1. ตรวจสอบแค่ Session ฝั่ง Server แทนการดึงจาก DB
  const session = await getSession();

  return (
    <nav className="h-16 bg-background border-b">
      <div className="h-full flex items-center justify-between max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8">
        {/* <Logo /> */}
        <div className="text-2xl font-bold text-slate-700">Gukkghu Blogs</div>

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          {session ? (
            // 3. ถ้า Login แล้ว แสดงปุ่ม Logout (ใช้ form action เรียก logoutAction)
            <form action={logoutAction}>
              <Button variant="outline" className="hidden sm:inline-flex">
                Logout
              </Button>
            </form>
          ) : (
            // 4. ถ้ายังไม่ Login แสดงปุ่ม Sign In
            <Link href="/login">
              <Button variant="outline" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
          )}

          <Button>Get Started</Button>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;