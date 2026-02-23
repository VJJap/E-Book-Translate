import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});

router.post("/", upload.single("pdf"), (req: Request, res: Response): void => {
    if (!req.file) {
        res.status(400).json({ error: "No PDF file uploaded" });
        return;
    }

    res.json({
        success: true,
        file: {
            id: req.file.filename,
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`,
        },
    });
});

export default router;
