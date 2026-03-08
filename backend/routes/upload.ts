import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// กำหนดการตั้งค่าสำหรับการเก็บไฟล์ (Storage) ของ Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // ระบุโฟลเดอร์สำหรับเก็บไฟล์ที่อัปโหลด (ให้อยู่ใน /backend/uploads)
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่โดยใช้ UUID ต่อด้วยชื่อไฟล์เดิม เพื่อป้องกันปัญหาชื่อไฟล์ซ้ำกัน
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

// ฟังก์ชันสำหรับคัดกรองประเภทของไฟล์ที่อนุญาตให้อัปโหลด
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // อนุญาตเฉพาะไฟล์ PDF เท่านั้น
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        // ถ้าไม่ใช่แจ้งเตือน Error
        cb(new Error("Only PDF files are allowed"));
    }
};

// สร้างตัวจัดการการอัปโหลด (Middleware)
const upload = multer({
    storage,
    fileFilter,
    // กำหนดขนาดไฟล์สูงสุดที่อนุญาต (ในที่นี้คือ 50MB)
    limits: { fileSize: 50 * 1024 * 1024 },
});

// POST API: สำหรับรับไฟล์ PDF เข้ามา (ฟิลด์ชื่อ "pdf")
router.post("/", upload.single("pdf"), (req: Request, res: Response): void => {
    // ตรวจสอบว่ามีไฟล์ถูกอัปโหลดมาด้วยหรือไม่
    if (!req.file) {
        res.status(400).json({ error: "No PDF file uploaded" });
        return;
    }

    // ถ้าอัปโหลดสำเร็จ ส่งข้อมูลต่างๆ ของไฟล์ และ URL กลับไปยัง Frontend
    res.json({
        success: true,
        file: {
            id: req.file.filename, // ใช้ชื่อที่สุ่มเป็น ID
            originalName: req.file.originalname, // ชื่อไฟล์ดั้งเดิม
            filename: req.file.filename, // ชื่อไฟล์ที่บันทึกแล้ว
            size: req.file.size, // ขนาดไฟล์เป็น byte
            url: `/uploads/${req.file.filename}`, // URL สำหรับเข้าถึงหน้าเว็บเพื่อดูไฟล์
        },
    });
});

export default router;
