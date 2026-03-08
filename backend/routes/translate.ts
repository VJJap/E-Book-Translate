import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { OpenAI } from "openai";

// โหลดค่าตัวแปรสภาพแวดล้อม (Environment Variables) จากไฟล์ .env (เช่น API Key)
dotenv.config();

const router = express.Router();

// สร้างอินสแตนซ์ของ OpenAI โดยดึง API Key จาก .env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST API: รับรับข้อความเพื่อส่งไปยัง OpenAI ให้ทำการแปลภาษา
router.post("/", async (req: Request, res: Response): Promise<void> => {
    // รับข้อมูลจาก body ของ Request (ถ้าไม่มีภาษาต้นทาง/ปลายทาง ให้ใช้ค่าเริ่มต้น en -> th)
    const { text, sourceLang = "en", targetLang = "th" } = req.body;

    // ตรวจสอบว่ามีข้อความส่งมาให้แปลหรือไม่
    if (!text || text.trim() === "") {
        res.status(400).json({ error: "No text provided" });
        return;
    }

    try {
        // ส่งข้อความไปแปลผ่าน OpenAI API (ใช้โมเดล gpt-4o-mini)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    // กำหนดบทบาทให้ AI เป็นนักแปลมืออาชีพ
                    role: "system",
                    content: "You are a professional translator. Translate the given text to Thai. Return ONLY the translated text, no explanations, no quotes.",
                },
                {
                    // ข้อความที่ต้องการให้แปล
                    role: "user",
                    content: text.trim(),
                },
            ],
            // กำหนดอุณหภูมิความสร้างสรรค์ (0.3 คือเน้นความถูกต้อง แม่นยำ)
            temperature: 0.3,
            // จำกัดจำนวน Token เพื่อไม่ให้ข้อความยาวเกินไปและควบคุมค่าใช้จ่าย
            max_tokens: 1000,
        });

        // ดึงข้อความที่แปลเสร็จแล้วออกมา (ถ้าไม่มีให้คืนค่าเป็นสตริงว่าง)
        const translatedText = completion.choices[0].message.content?.trim() || "";

        // ตอบกลับไปยัง Frontend พร้อมกับข้อความที่แปลเสร็จแล้ว
        res.json({
            success: true,
            original: text.trim(),
            translated: translatedText,
            sourceLang,
            targetLang,
            provider: "openai",
        });
    } catch (err: any) {
        // จัดการกรณีเกิดข้อผิดพลาดในการเรียกใช้ OpenAI API
        console.error("OpenAI error:", err.message);
        res.status(500).json({ error: "Translation failed: " + err.message });
    }
});

export default router;
