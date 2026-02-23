import { useEffect, useRef, useState } from "react";
import { X, Copy, Check, Loader2, Languages } from "lucide-react";
import { PopupState } from "../pages/ViewerPage";

interface TranslationPopupProps {
    popup: PopupState;
    onClose: () => void;
}

export default function TranslationPopup({ popup, onClose }: TranslationPopupProps) {
    const { text, translated, loading, error, position } = popup;
    const popupRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

    useEffect(() => {
        if (!popupRef.current || !position) return;

        const popupEl = popupRef.current;
        const popupRect = popupEl.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        // const viewportHeight = window.innerHeight;

        // Actually the previous JS code used screenX and screenY but we typed it with x/y. I will adjust the type or logic. 
        // In original: `position.screenX`. Let's assume position has `left` and `top`.
        // I mapped it to x/y which might be wrong. Let me fix the type assuming standard usage. I'll type it fully.

        // original: left = position.screenX - popupRect.width / 2;
        // original: top = position.screenY - popupRect.height - 12;

        const screenX = (position as any).screenX || position.x;
        const screenY = (position as any).screenY || position.y;

        let popupLeft = screenX - popupRect.width / 2;
        let popupTop = screenY - popupRect.height - 12;

        if (popupLeft < 8) popupLeft = 8;
        if (popupLeft + popupRect.width > viewportWidth - 8) {
            popupLeft = viewportWidth - popupRect.width - 8;
        }
        if (popupTop < 8) {
            popupTop = screenY + 28;
        }

        setStyle({
            position: "fixed",
            left: `${popupLeft}px`,
            top: `${popupTop}px`,
            opacity: 1,
        });
    }, [position, translated, loading]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleCopy = async () => {
        if (!translated) return;
        try {
            await navigator.clipboard.writeText(translated);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    };

    return (
        <div
            ref={popupRef}
            className="translation-popup z-50 w-80 max-w-sm bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl overflow-hidden"
            style={style}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-700/60 border-b border-slate-600">
                <div className="flex items-center gap-2">
                    <Languages size={16} className="text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        คำแปล
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 space-y-3">
                <div className="bg-slate-900/60 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">ต้นฉบับ</p>
                    <p className="text-slate-200 text-sm leading-relaxed line-clamp-3">{text}</p>
                </div>

                <div className="bg-indigo-950/60 border border-indigo-800/40 rounded-xl p-3 min-h-[64px] flex items-start">
                    {loading ? (
                        <div className="flex items-center gap-2 text-indigo-400 w-full justify-center py-2">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm">กำลังแปล...</span>
                        </div>
                    ) : error ? (
                        <p className="text-red-400 text-sm">{error}</p>
                    ) : (
                        <div className="w-full">
                            <p className="text-xs text-indigo-400 mb-1">ภาษาไทย</p>
                            <p className="text-white text-sm leading-relaxed font-medium" style={{ fontFamily: "'Sarabun', sans-serif" }}>
                                {translated}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {!loading && !error && translated && (
                <div className="px-4 pb-4">
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-sm transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check size={15} className="text-green-400" />
                                <span className="text-green-400">คัดลอกแล้ว!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={15} />
                                <span>คัดลอกคำแปล</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
