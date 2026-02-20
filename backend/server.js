const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const uploadRouter = require("./routes/upload");
const translateRouter = require("./routes/translate");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/api/upload", uploadRouter);
app.use("/api/translate", translateRouter);

app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "E-Book Translate API is running" });
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
