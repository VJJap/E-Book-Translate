import React, { useState, useRef } from "react";
import { Upload, BookOpen, FileText, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import '@fontsource/nunito'

export default function UploadPage({ onFileUploaded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("กรุณาอัพโหลดไฟล์ PDF เท่านั้น");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 50MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onFileUploaded({
        ...response.data.file,
        localFile: file,
      });
    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการอัพโหลด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ fontFamily: "'Nunito', serif" }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600 rounded-2xl">
              <BookOpen size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Nunito', serif" }}>Everytin Smart Translate</h1>
          <p className="text-slate-400 text-lg">
            อัพโหลด PDF แล้วแปลภาษาได้ทันที ด้วยการลากหรือดับเบิ้ลคลิกที่ข้อความ
          </p>
        </div>

        <div
          className={`upload-zone border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragOver
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-600 bg-slate-800/50 hover:border-indigo-500 hover:bg-indigo-500/5"
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleInputChange}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={48} className="text-indigo-400 animate-spin" />
              <p className="text-slate-300 text-lg font-medium">กำลังอัพโหลด...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-full transition-colors ${isDragOver ? "bg-indigo-500/20" : "bg-slate-700"
                  }`}
              >
                <Upload
                  size={40}
                  className={isDragOver ? "text-indigo-400" : "text-slate-400"}
                />
              </div>
              <div>
                <p className="text-white text-xl font-semibold mb-1">
                  {isDragOver ? "วางไฟล์ที่นี่" : "ลากไฟล์มาวาง หรือคลิกเพื่อเลือก"}
                </p>
                <p className="text-slate-400">รองรับไฟล์ PDF ขนาดสูงสุด 50MB</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: Upload, title: "อัพโหลด PDF", desc: "รองรับไฟล์ทุกขนาด" },
            { icon: FileText, title: "เลือกข้อความ", desc: "ลากหรือดับเบิ้ลคลิก" },
            { icon: BookOpen, title: "รับคำแปล", desc: "Popup แสดงทันที" },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50"
            >
              <Icon size={24} className="text-indigo-400" />
              <p className="text-white font-medium text-sm">{title}</p>
              <p className="text-slate-500 text-xs text-center">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
