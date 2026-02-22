import React, { useState } from "react";
import { History, Trash2, Copy, Languages, Loader2, Send } from "lucide-react";

export default function TranslationHistory({ history, onClear, onManualTranslate, isTranslatingManual }) {
  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("th");

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch { }
  };

  const handleTranslate = () => {
    if (!inputText.trim() || isTranslatingManual) return;
    onManualTranslate(inputText, sourceLang, targetLang);
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800">
      {/* Manual Translation Section */}
      <div className="p-4 border-b border-slate-700 shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <Languages size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold text-slate-300">แปลข้อความ</span>
        </div>

        <div className="flex gap-2 text-xs">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="flex-1 bg-slate-700/50 text-slate-300 border border-slate-600 rounded p-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="en">English</option>
            <option value="th">Thai</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese</option>
          </select>
          <span className="text-slate-500 self-center">→</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="flex-1 bg-slate-700/50 text-slate-300 border border-slate-600 rounded p-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="th">Thai</option>
            <option value="en">English</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese</option>
          </select>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์หรือวางข้อความ... (กด Enter เพื่อแปล)"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none min-h-[80px]"
            disabled={isTranslatingManual}
          />
          <button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslatingManual}
            className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
          >
            {isTranslatingManual ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <History size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold text-slate-300">ประวัติคำแปล</span>
          <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors"
          title="ล้างประวัติ"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50 bg-slate-800">
        {history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            ยังไม่มีประวัติการแปล<br />ลองพิมพ์ข้อความด้านบนหรือคลุมดำใน PDF
          </div>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              className="px-4 py-3 hover:bg-slate-700/30 transition-colors group"
            >
              <p className="text-xs text-slate-500 mb-1 line-clamp-2" title={item.original}>{item.original}</p>
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-sm text-white leading-relaxed flex-1"
                  style={{ fontFamily: "'Sarabun', sans-serif" }}
                >
                  {item.translated}
                </p>
                <button
                  onClick={() => handleCopy(item.translated)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-slate-300 transition-all shrink-0 mt-0.5"
                  title="คัดลอก"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
