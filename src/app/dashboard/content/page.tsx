"use client";

import { createPostAction, PostFormState } from "@/action/post";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect, useRef, useState, useMemo, useCallback } from "react";
import ImageUpload from "@/components/dashboard/image-upload";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// นำเข้า CSS ของ React Quill New
import "react-quill-new/dist/quill.snow.css";

// โหลด ReactQuill แบบ Dynamic จาก react-quill-new แบบไม่ใช้ SSR
import type ReactQuillType from "react-quill-new";
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false, 
  loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">กำลังโหลดเครื่องมือจัดรูปแบบ...</div>
}) as any;

const initialState: PostFormState = {
  success: false,
  inputs: {
    title: "",
    content: "",
    thumbnail: "",
    isVipOnly: false,
    published: true,
  },
};

export default function ContentAdminPage() {
  const [state, formAction] = useActionState(createPostAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  // เพิ่ม Ref สำหรับเข้าถึง ReactQuill Instance
  const reactQuillRef = useRef<any>(null);
  
  const [resetKey, setResetKey] = useState<number>(Date.now());
  const [editorContent, setEditorContent] = useState<string>(state.inputs?.content || "");

  useEffect(() => {
    if (state.success) {
      toast.success("บันทึกบทความเรียบร้อยแล้ว! 🎉");
      formRef.current?.reset();
      setResetKey(Date.now()); 
      setEditorContent("");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state.success, state.message]);

  // ฟังก์ชันจัดการเมื่อผู้ใช้กดปุ่มรูปภาพบน Toolbar
  const imageHandler = useCallback(() => {
    // 1. สร้าง input type="file" ซ่อนไว้
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    // 2. เมื่อผู้ใช้เลือกไฟล์
    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const toastId = toast.loading("กำลังอัปโหลดรูปลงเนื้อหา...");

      try {
        // 3. เตรียมข้อมูลส่งไป API (Cloudinary เดิมของคุณ)
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        const imageUrl = data.url;

        // 4. เอา URL ที่ได้ไปแทรกลงใน Editor ตำแหน่งที่ Cursor อยู่
        const quill = reactQuillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", imageUrl);
          quill.setSelection(range.index + 1); // เลื่อน cursor ไปหลังรูป
        }

        toast.success("อัปโหลดรูปภาพสำเร็จ", { id: toastId });
      } catch (error) {
        console.error(error);
        toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ", { id: toastId });
      }
    };
  }, []);

  // ใช้ useMemo ห่อ modules ไว้เพื่อป้องกัน Toolbar หายเวลาพิมพ์ข้อความ
  // และทำให้สามารถเรียกใช้ imageHandler ใน scope นี้ได้
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image', 'blockquote', 'code-block'], // เพิ่ม 'image' ตรงนี้
        ['clean']
      ],
      handlers: {
        // สั่งให้ปุ่ม image เรียกใช้ฟังก์ชันของเราแทนการฝัง Base64 ปกติ
        image: imageHandler 
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), [imageHandler]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">บทความใหม่</h2>
          <p className="text-sm text-gray-500 mt-0.5">กรอกข้อมูลด้านล่างเพื่อสร้างบทความ</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>

      {state.message && !state.success && (
        <div className="flex items-start gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {state.message}
        </div>
      )}

      <form action={formAction} ref={formRef}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                หัวข้อบทความ <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                defaultValue={state.inputs?.title}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="เช่น เทคนิคการเขียน Next.js ให้ประสิทธิภาพสูง"
              />
            </div>

            <ImageUpload
              key={resetKey} 
              name="thumbnail"
              defaultUrl={state.inputs?.thumbnail}
              label="รูปภาพปก"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                เนื้อหา <span className="ml-1 text-red-500">*</span>
              </label>
              
              <input type="hidden" name="content" value={editorContent} />
              
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                <ReactQuill 
                  ref={reactQuillRef} // ผูก Ref เข้ากับ Component
                  theme="snow" 
                  value={editorContent} 
                  onChange={setEditorContent} 
                  modules={modules}
                  className="h-64 sm:h-80"
                />
              </div>

              {state.errors?.content && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {state.errors.content[0]}
                </p>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" name="isVipOnly" defaultChecked={state.inputs?.isVipOnly} className="peer sr-only" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-amber-400 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors select-none">
                  ⭐ เฉพาะ VIP
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" name="published" defaultChecked={state.inputs?.published} className="peer sr-only" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors select-none">
                  🌐 เผยแพร่ทันที
                </span>
              </label>
            </div>

            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-500/20 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              บันทึกบทความ
            </Button>
          </div>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{__html: `
        .quill { display: flex; flex-direction: column; }
        .ql-container { font-size: 16px; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; border: none !important; flex: 1; overflow-y: auto; }
        .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; border-top: none !important; border-left: none !important; border-right: none !important; border-bottom: 1px solid #e5e7eb !important; background-color: #f9fafb; z-index: 10; }
        .ql-editor { min-height: 100%; }
      `}} />
    </div>
  );
}