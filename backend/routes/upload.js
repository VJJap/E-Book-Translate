const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

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

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post("/", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
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

module.exports = router;
