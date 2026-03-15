"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition, useMemo } from "react";
import { useActionState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">กำลังโหลดเครื่องมือจัดรูปแบบ...</div>
});
import {
  updatePostAction,
  deletePostAction,
  PostAdminFormState,
  PostListResult,
} from "@/action/post";
import Link from "next/link";
import ImageUpload from "@/components/dashboard/image-upload";
import { toast } from "sonner";

type PostRow = PostListResult["posts"][number];

// ─── Helpers ─────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string[] }) {
  if (!msg?.length) return null;
  return <p className="text-red-500 text-xs mt-1">{msg[0]}</p>;
}

function FormInput({
  label, name, type = "text", defaultValue, placeholder, hint,
}: {
  label: string; name: string; type?: string;
  defaultValue?: string; placeholder?: string; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type} name={name} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────

function ToggleField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative" onClick={() => setChecked(c => !c)}>
        <input type="checkbox" name={name} className="sr-only" checked={checked} onChange={() => {}} />
        <div className={`w-10 h-5 rounded-full transition-colors ${checked ? "bg-indigo-500" : "bg-gray-200"}`} />
        <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors select-none">{label}</span>
    </label>
  );
}

// ─── Badges ──────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl z-10 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Edit Post Modal ──────────────────────────────────────────

function EditPostModal({ post, onClose }: { post: PostRow; onClose: () => void }) {
  const boundAction = updatePostAction.bind(null, post.id);
  const [state, formAction, pending] = useActionState(boundAction, { success: false });

  useEffect(() => {
    if (state.success) {
      toast.success("แก้ไขบทความสำเร็จ");
      onClose();
    }
  }, [state.success, onClose]);

  const [editorContent, setEditorContent] = useState(post.content);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  }), []);

  return (
    <Modal open={true} onClose={onClose} title="แก้ไขบทความ">
      {state.message && !state.success && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{state.message}</div>
      )}
      <form action={formAction} className="space-y-4">
        <FormInput label="หัวข้อ" name="title" defaultValue={post.title} placeholder="หัวข้อบทความ" />
        <FieldError msg={state.errors?.title} />

        <ImageUpload
          name="thumbnail"
          defaultUrl={post.thumbnail ?? ""}
          label="รูปภาพปก"
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">เนื้อหา</label>
          <input type="hidden" name="content" value={editorContent} />
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <ReactQuill 
              theme="snow" 
              value={editorContent} 
              onChange={setEditorContent} 
              modules={modules}
              className="h-64 sm:h-80"
            />
          </div>
          <FieldError msg={state.errors?.content} />
          
          <style dangerouslySetInnerHTML={{__html: `
            .ql-container { font-size: 16px; border: none !important; display: flex; flex-direction: column; overflow: hidden; }
            .ql-toolbar { border-top: none !important; border-left: none !important; border-right: none !important; border-bottom: 1px solid #e5e7eb !important; background-color: #f9fafb; z-index: 10; }
            .ql-editor { flex: 1; overflow-y: auto; min-height: 200px; }
            .quill { display: flex; flex-direction: column; height: 100%; }
          `}} />
        </div>

        <div className="flex gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <ToggleField name="isVipOnly" label="⭐ เฉพาะ VIP" defaultChecked={post.isVipOnly} />
          <ToggleField name="published" label="🌐 เผยแพร่" defaultChecked={post.published} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">ยกเลิก</button>
          <button type="submit" disabled={pending} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
            {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────

function DeleteConfirm({ post, onClose }: { post: PostRow; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePostAction(post.id);
      if (result?.success === false) {
        toast.error(result.message ?? "เกิดข้อผิดพลาดในการลบ");
      } else {
        toast.success("ลบบทความสำเร็จ");
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
          <p className="font-semibold text-gray-900 line-clamp-1">ลบบทความ "{post.title}"?</p>
          <p className="text-sm text-gray-500 mt-1">การลบไม่สามารถย้อนกลับได้</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">ยกเลิก</button>
          <button onClick={handleDelete} disabled={isPending} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
            {isPending ? "กำลังลบ..." : "ลบเลย"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main PostsTable ──────────────────────────────────────────

export default function PostsTable({ data, search: initialSearch }: { data: PostListResult; search: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [editPost, setEditPost] = useState<PostRow | null>(null);
  const [deletePost, setDeletePost] = useState<PostRow | null>(null);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    if (key !== "page") params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams("search", val), 400);
  };

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(d));

  return (
    <>
      {editPost && <EditPostModal post={editPost} onClose={() => setEditPost(null)} />}
      {deletePost && <DeleteConfirm post={deletePost} onClose={() => setDeletePost(null)} />}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">บทความทั้งหมด</h2>
            <p className="text-sm text-gray-500 mt-0.5">พบ {data.total} รายการ</p>
          </div>
          <Link
            href="/dashboard/content"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            เขียนบทความใหม่
          </Link>
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
            placeholder="ค้นหาจากหัวข้อ..."
            className="w-full sm:max-w-sm pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">บทความ</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">ผู้เขียน</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">สถานะ</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">วันที่</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400">
                      <p className="text-4xl mb-3">📝</p>
                      <p className="font-medium">ไม่พบบทความ</p>
                      {searchValue && <p className="text-xs mt-1">ลองค้นหาด้วยคำอื่น</p>}
                    </td>
                  </tr>
                ) : (
                  data.posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-500 flex-shrink-0 text-base">
                            {post.thumbnail ? "🖼" : "📄"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[220px]">{post.title}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{post.id.slice(0, 12)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{post.authorName}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {post.isVipOnly && <Badge label="⭐ VIP" color="bg-amber-100 text-amber-700" />}
                          <Badge
                            label={post.published ? "🌐 เผยแพร่" : "✏️ Draft"}
                            color={post.published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">{fmtDate(post.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/blog/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition"
                            title="ดูหน้าบทความ"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <button
                            onClick={() => setEditPost(post)}
                            className="w-8 h-8 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition"
                            title="แก้ไข"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletePost(post)}
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
                  onClick={() => pushParams("page", String(data.page - 1))}
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
                      onClick={() => pushParams("page", String(p))}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${p === data.page
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "border border-gray-200 text-gray-600 hover:bg-white hover:border-indigo-300 hover:text-indigo-600"}`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => pushParams("page", String(data.page + 1))}
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
