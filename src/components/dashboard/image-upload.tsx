"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageUploadProps {
  name?: string;           // ชื่อ hidden input ที่เก็บ URL (default: "thumbnail")
  defaultUrl?: string;     // URL รูปเดิม (สำหรับ edit)
  label?: string;
}

export default function ImageUpload({
  name = "thumbnail",
  defaultUrl = "",
  label = "รูปภาพปก",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(defaultUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [url, setUrl] = useState<string>(defaultUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(defaultUrl);
    setPreview(defaultUrl);
  }, [defaultUrl]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("รองรับเฉพาะไฟล์รูปภาพ");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "อัพโหลดไม่สำเร็จ");
        setPreview(url); // คืนค่าเดิม
        return;
      }

      setUrl(data.url);
    } catch {
      setError("เกิดข้อผิดพลาดในการอัพโหลด");
      setPreview(url);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      {/* Hidden input เก็บ URL จริงที่ส่งไปยัง server action */}
      <input type="hidden" name={name} value={url} />

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors group"
        style={{ minHeight: "160px" }}
      >
        {preview ? (
          <div className="relative w-full h-40">
            <Image src={preview} alt="preview" fill className="object-cover" />
            {/* Overlay เมื่อ hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-medium">คลิกเพื่อเปลี่ยนรูป</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400 group-hover:text-indigo-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">คลิกหรือลากไฟล์มาวาง</p>
            <p className="text-xs">PNG, JPG, WEBP (max 5MB)</p>
          </div>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
            <svg className="w-6 h-6 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-indigo-600 font-medium">กำลังอัพโหลด...</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* ปุ่มลบรูป */}
      {url && !uploading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setUrl(""); setPreview(""); }}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          ✕ ลบรูปภาพ
        </button>
      )}

      {/* File input (hidden) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
