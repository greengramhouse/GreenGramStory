"use client";

import { useActionState, useEffect, useState, use } from "react";
import { Eye, EyeOff, UserPlus, Lock, Mail, User } from "lucide-react"; // ต้องลง lucide-react ก่อนนะครับ หรือถ้าไม่มีให้ลบ icon ออก
import { LoginState, loginUser, registerUser } from "@/action/user";
import { toast } from "sonner";
import Link from "next/link";

// กำหนด Initial State ให้ตรงกับ Type
const initialState: LoginState = {
  success: false,
  inputs: { email: "", password: "" },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl = "/blog" } = use(searchParams);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, action, pending] = useActionState(loginUser, initialState);

  useEffect(() => {
    if (!state.success) {
      // การเข้าถึงแบบปลอดภัย (Type Safe)
      // state?.error?.form จะเป็น string[] | undefined
      // การเติม ?.length จะได้ number | undefined

      // วิธีเช็คที่ปลอดภัยที่สุด:
      const formErrors = state.error?.form;

      if (formErrors && formErrors.length > 0) {
        // แสดงผลเฉพาะเมื่อมี error จริงๆ
        console.log("Error count:", formErrors.length);
        toast.error(formErrors[0]); // แสดง error ตัวแรก
      }
    }
  }, [state]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        {/* Header ส่วนหัว */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            กรุณาป้อน email และ รหัสผ่าน เข้าสู่ระบบ
          </p>
        </div>
        {/* Form Input */}
        <form action={action} className="mt-8 space-y-6" noValidate>
          {/* Hidden callbackUrl */}
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div className="space-y-4">
            {/* Input: Email (จำเป็นต้องมีตาม DB Schema) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                  placeholder="somchai@example.com"
                />
              </div>
              {state?.error?.email && (
                <p className="mt-1 text-xs text-red-500">
                  {state?.error?.email[0]}
                </p>
              )}
            </div>

            {/* Input: Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {state?.error?.password && (
                <p className="mt-1 text-xs text-red-500">
                  {state.error?.password[0]}
                </p>
              )}
            </div>

            {/* Input: Confirm Password */}
          </div>

          {/* ปุ่ม Submit */}
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? (
              <span className="flex items-center">
                <svg
                  className="mr-3 h-5 w-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                กำลังประมวลผล...
              </span>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>

          {/* ลิงก์ไปหน้า Login */}
          <div className="text-center text-sm">
            <span className="text-gray-500">ยังไม่ลงทะเบียน? </span>
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              คลิกลงทะเบียนที่นี่
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
