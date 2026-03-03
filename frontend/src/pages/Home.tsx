import { BookOpen, Languages, Upload } from "lucide-react";
import "@fontsource/nunito";

type HomeProps = {
    onStart: () => void;
};

export default function Home({ onStart }: HomeProps) {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{ fontFamily: "'Nunito', serif" }}
        >
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl">
                            <BookOpen size={32} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
                        Everytin <span className="text-indigo-400">Smart Translate</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        อัพโหลด PDF แล้วแปลได้ทันทีด้วยการลากหรือดับเบิ้ลคลิกที่ข้อความ
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button
                        type="button"
                        onClick={onStart}
                        className="px-8 py-3 rounded-full font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        Start Translate
                    </button>
                    <p className="text-xs text-slate-500 bg-slate-800/60 border border-slate-700/60 px-3 py-1 rounded-full">
                        รองรับไฟล์ PDF และการแปลแบบเลือกข้อความ
                    </p>
                </div>

            </div>
        </div>
    );
}
