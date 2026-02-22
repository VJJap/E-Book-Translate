import React, { useState, useCallback } from "react";
import { ArrowLeft, BookOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import PDFViewer from "../components/PDFViewer.jsx";
import TranslationPopup from "../components/TranslationPopup.jsx";
import TranslationHistory from "../components/TranslationHistory.jsx";
import axios from "axios";

export default function ViewerPage({ file, onBack }) {
  const [popup, setPopup] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslatingManual, setIsTranslatingManual] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Generalized translation function
  const translateText = async (text, sourceLang, targetLang, isManual = false) => {
    try {
      if (isManual) setIsTranslatingManual(true);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const response = await axios.post(`${API_BASE_URL}/api/translate`, {
        text,
        sourceLang,
        targetLang,
      });

      const result = {
        original: text,
        translated: response.data.translated,
        // Manual translations won't have a position, they just go to history
      };

      setHistory((prev) => {
        const exists = prev.find((h) => h.original === text);
        if (exists) return prev;
        return [result, ...prev].slice(0, 50);
      });

      return response.data;
    } catch (err) {
      console.error("Translation error:", err);
      throw err;
    } finally {
      if (isManual) setIsTranslatingManual(false);
    }
  };

  const handleTextSelected = useCallback(async (text, position) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 1) return;

    setPopup({ text: trimmed, position, translated: null, loading: true });
    setIsTranslating(true);
    // Auto-open sidebar when selecting text to show history
    setIsSidebarOpen(true);

    try {
      const data = await translateText(trimmed, "en", "th", false);
      setPopup({ text: trimmed, position, translated: data.translated, loading: false });
    } catch (err) {
      setPopup({ text: trimmed, position, error: "แปลไม่สำเร็จ กรุณาลองใหม่", loading: false });
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const handleManualTranslate = async (text, sourceLang, targetLang) => {
    try {
      await translateText(text, sourceLang, targetLang, true);
    } catch (err) {
      // Error handling is mostly console logged in translateText, 
      // but we could add a toast notification here in the future.
    }
  };

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
            <span className="text-white font-medium text-sm truncate max-w-xs block">
              {file.originalName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 bg-slate-700 px-3 py-1 rounded-full hidden sm:block">
            ลากหรือดับเบิ้ลคลิกที่ข้อความเพื่อแปล
          </span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSidebarOpen
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-transparent"
              }`}
          >
            {isSidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            <span className="hidden sm:inline">เครื่องมือแปล</span>
          </button>
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

        {isSidebarOpen && (
          <aside className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto shrink-0 flex flex-col transition-all duration-300">
            <TranslationHistory
              history={history}
              onClear={() => setHistory([])}
              onManualTranslate={handleManualTranslate}
              isTranslatingManual={isTranslatingManual}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
