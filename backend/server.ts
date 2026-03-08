import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

// นำเข้า Router สำหรับการจัดการ API แต่ละส่วน
import uploadRouter from "./routes/upload";
import translateRouter from "./routes/translate";

const app = express();
// กำหนดพอร์ตสำหรับรันเซิร์ฟเวอร์
const PORT = process.env.PORT || 3001;

// เปิดใช้งาน CORS เพื่อให้ Frontend (ที่อาจอยู่คนละพอร์ต) สามารถเรียกใช้งาน API ได้
app.use(cors());
// อนุญาตให้รับและแปลงข้อมูล (Payload) ในรูปแบบ JSON
app.use(express.json());

// ตรวจสอบและสร้างโฟลเดอร์สำหรับเก็บไฟล์ที่อัปโหลด (ถ้ายังไม่มี)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// กำหนดเส้นทาง (Routes) หลักสำหรับ API
app.use("/api/upload", uploadRouter);       // API สำหรับอัปโหลดไฟล์
app.use("/api/translate", translateRouter); // API สำหรับแปลภาษา

// อนุญาตให้เข้าถึงอ่านไฟล์ที่อยู่ในโฟลเดอร์ uploads ผ่าน URL ได้ตรงๆ (เช่น /uploads/my-pdf.pdf)
app.use("/uploads", express.static(uploadsDir));

// API สำหรับตรวจสอบว่าเซิร์ฟเวอร์ยังทำงานปกติหรือไม่ (Health Check)
app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", message: "E-Book Translate API is running" });
});

// เริ่มต้นรันเซิร์ฟเวอร์ตามพอร์ตที่กำหนดไว้
app.listen(PORT, () => {
    console.log(`Backend server running at port ${PORT}`);
});
