import React from "react";
import { History, Trash2, Copy } from "lucide-react";

export default function TranslationHistory({ history, onClear }) {
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
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

      <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50">
        {history.map((item, index) => (
          <div
            key={index}
            className="px-4 py-3 hover:bg-slate-700/30 transition-colors group"
          >
            <p className="text-xs text-slate-500 mb-1 truncate">{item.original}</p>
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
        ))}
      </div>
    </div>
  );
}
