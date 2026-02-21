import React, { useState, useCallback } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import PDFViewer from "../components/PDFViewer.jsx";
import TranslationPopup from "../components/TranslationPopup.jsx";
import TranslationHistory from "../components/TranslationHistory.jsx";
import axios from "axios";

export default function ViewerPage({ file, onBack }) {
  const [popup, setPopup] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState([]);

  const handleTextSelected = useCallback(async (text, position) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 1) return;

    setPopup({ text: trimmed, position, translated: null, loading: true });
    setIsTranslating(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const response = await axios.post(`${API_BASE_URL}/api/translate`, {
        text: trimmed,
        sourceLang: "en",
        targetLang: "th",
      });

      const result = {
        original: trimmed,
        translated: response.data.translated,
        position,
      };

      setPopup({ text: trimmed, position, translated: response.data.translated, loading: false });

      setHistory((prev) => {
        const exists = prev.find((h) => h.original === trimmed);
        if (exists) return prev;
        return [result, ...prev].slice(0, 50);
      });
    } catch (err) {
      setPopup({ text: trimmed, position, error: "แปลไม่สำเร็จ กรุณาลองใหม่", loading: false });
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const handleClosePopup = useCallback(() => {
    setPopup(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">กลับ</span>
          </button>
          <div className="w-px h-5 bg-slate-600" />
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-400" />
            <span className="text-white font-medium text-sm truncate max-w-xs">
              {file.originalName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-700 px-3 py-1 rounded-full">
            ลากหรือดับเบิ้ลคลิกที่ข้อความเพื่อแปล
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto relative" onClick={popup ? handleClosePopup : undefined}>
          <PDFViewer file={file} onTextSelected={handleTextSelected} />

          {popup && (
            <TranslationPopup
              popup={popup}
              onClose={handleClosePopup}
            />
          )}
        </main>

        {history.length > 0 && (
          <aside className="w-72 bg-slate-800 border-l border-slate-700 overflow-y-auto shrink-0">
            <TranslationHistory history={history} onClear={() => setHistory([])} />
          </aside>
        )}
      </div>
    </div>
  );
}
