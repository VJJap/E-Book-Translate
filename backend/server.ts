import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import uploadRouter from "./routes/upload";
import translateRouter from "./routes/translate";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/api/upload", uploadRouter);
app.use("/api/translate", translateRouter);

app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", message: "E-Book Translate API is running" });
});

app.listen(PORT, () => {
    console.log(`Backend server running at port ${PORT}`);
});
