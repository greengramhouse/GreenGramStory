"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  createUserAdminAction,
  updateUserAction,
  deleteUserAction,
  AdminUserFormState,
  UserListResult,
} from "@/action/user";
import { useActionState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────

type UserRow = UserListResult["users"][number];

interface UsersTableProps {
  data: UserListResult;
  search: string;
}

// ─── Helper: Field Error ──────────────────────────────────────

function FieldError({ msg }: { msg?: string[] }) {
  if (!msg?.length) return null;
  return <p className="text-red-500 text-xs mt-1">{msg[0]}</p>;
}

// ─── Input component ─────────────────────────────────────────

function FormInput({
  label, name, type = "text", defaultValue, placeholder, required, hint,
}: {
  label: string; name: string; type?: string; defaultValue?: string;
  placeholder?: string; required?: boolean; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────

function RoleBadge({ role }: { role: "admin" | "user" | "vip" }) {
  const styles = {
    admin: "bg-violet-100 text-violet-700",
    vip: "bg-amber-100 text-amber-700",
    user: "bg-gray-100 text-gray-600",
  };
  const labels = {
    admin: "👑 Admin",
    vip: "⭐ VIP",
    user: "👤 User",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[role]}`}>
      {labels[role]}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Add User Modal Form ─────────────────────────────────────

const addInitialState: AdminUserFormState = { success: false };

function AddUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createUserAdminAction, addInitialState);

  useEffect(() => {
    if (state.success) {
      toast.success("เพิ่มผู้ใช้งานสำเร็จ");
      onClose();
    } else if (state.message && !state.success && state.message !== undefined) {
      // error handled inline
    }
  }, [state.success, state.message, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="เพิ่มผู้ใช้งานใหม่">
      {state.message && !state.success && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {state.message}
        </div>
      )}
      <form action={formAction} className="space-y-4">
        <FormInput label="ชื่อ" name="name" placeholder="ชื่อผู้ใช้งาน" required />
        <FieldError msg={state.errors?.name} />
        <FormInput label="อีเมล" name="email" type="email" placeholder="email@example.com" required />
        <FieldError msg={state.errors?.email} />
        <FormInput label="รหัสผ่าน" name="password" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" required />
        <FieldError msg={state.errors?.password} />
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Role <span className="text-red-500">*</span></label>
          <select
            name="role"
            defaultValue="user"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          >
            <option value="user">👤 User</option>
            <option value="vip">⭐ VIP</option>
            <option value="admin">👑 Admin</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition"
          >
            {pending ? "กำลังบันทึก..." : "เพิ่มผู้ใช้งาน"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Edit User Modal Form ─────────────────────────────────────

function EditUserModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const boundAction = updateUserAction.bind(null, user.id);
  const [state, formAction, pending] = useActionState(boundAction, { success: false });

  useEffect(() => {
    if (state.success) {
      toast.success("แก้ไขข้อมูลผู้ใช้สำเร็จ");
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <Modal open={true} onClose={onClose} title="แก้ไขข้อมูลผู้ใช้งาน">
      {state.message && !state.success && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {state.message}
        </div>
      )}
      <form action={formAction} className="space-y-4">
        <FormInput label="ชื่อ" name="name" defaultValue={user.name} required />
        <FieldError msg={state.errors?.name} />
        <FormInput label="อีเมล" name="email" type="email" defaultValue={user.email} required />
        <FieldError msg={state.errors?.email} />
        <FormInput label="รหัสผ่านใหม่" name="password" type="password" placeholder="ปล่อยว่างถ้าไม่ต้องการเปลี่ยน" hint="เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยนรหัสผ่าน" />
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Role</label>
          <select
            name="role"
            defaultValue={user.role}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          >
            <option value="user">👤 User</option>
            <option value="vip">⭐ VIP</option>
            <option value="admin">👑 Admin</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition"
          >
            {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────

function DeleteConfirm({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (result?.success === false) {
        toast.error("เกิดข้อผิดพลาดในการลบ");
      } else {
        toast.success(`ลบผู้ใช้งาน "${user.name}" สำเร็จ`);
      }
      onClose();
    });
  };

  return (
    <Modal open={true} onClose={onClose} title="ยืนยันการลบ">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900">ลบผู้ใช้งาน "{user.name}"?</p>
          <p className="text-sm text-gray-500 mt-1">การลบไม่สามารถย้อนกลับได้</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            ยกเลิก
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition"
          >
            {isPending ? "กำลังลบ..." : "ลบเลย"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main UsersTable ──────────────────────────────────────────

export default function UsersTable({ data, search: initialSearch }: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams("search", val), 400);
  };

  const handlePage = (p: number) => pushParams("page", String(p));

  const fmtDate = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(d))
      : "—";

  return (
    <>
      {/* ── Modals ── */}
      <AddUserModal open={showAdd} onClose={() => setShowAdd(false)} />
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} />}
      {deleteUser && <DeleteConfirm user={deleteUser} onClose={() => setDeleteUser(null)} />}

      {/* ── Page ── */}
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">ผู้ใช้งานทั้งหมด</h2>
            <p className="text-sm text-gray-500 mt-0.5">พบ {data.total} รายการ</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มผู้ใช้งาน
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={searchValue}
            onChange={handleSearch}
            type="text"
            placeholder="ค้นหาจากชื่อหรืออีเมล..."
            className="w-full sm:max-w-sm pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">#</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">ชื่อ / อีเมล</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">สมัครเมื่อ</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400">
                      <p className="text-4xl mb-3">👤</p>
                      <p className="font-medium">ไม่พบข้อมูลผู้ใช้งาน</p>
                      {searchValue && <p className="text-xs mt-1">ลองค้นหาด้วยคำอื่น</p>}
                    </td>
                  </tr>
                ) : (
                  data.users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4 text-gray-400 font-mono text-xs">{u.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{fmtDate(u.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <button
                            onClick={() => setEditUser(u)}
                            className="w-8 h-8 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition"
                            title="แก้ไข"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteUser(u)}
                            className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition"
                            title="ลบ"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                หน้า {data.page} / {data.totalPages} (ทั้งหมด {data.total} รายการ)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePage(data.page - 1)}
                  disabled={data.page <= 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - data.page) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                        p === data.page
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "border border-gray-200 text-gray-600 hover:bg-white hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                <button
                  onClick={() => handlePage(data.page + 1)}
                  disabled={data.page >= data.totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
