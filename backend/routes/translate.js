const express = require("express");
const router = express.Router();

const mockTranslations = {
  "hello": "สวัสดี",
  "world": "โลก",
  "book": "หนังสือ",
  "chapter": "บท",
  "page": "หน้า",
  "the": "นั้น",
  "is": "คือ",
  "and": "และ",
  "of": "ของ",
  "in": "ใน",
  "to": "ไปยัง",
  "a": "หนึ่ง",
};

function mockTranslate(text) {
  const words = text.toLowerCase().split(/\s+/);
  const translated = words.map((w) => mockTranslations[w] || w);
  return `[แปล] ${translated.join(" ")}`;
}

router.post("/", async (req, res) => {
  const { text, sourceLang = "en", targetLang = "th" } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "No text provided" });
  }

  await new Promise((resolve) => setTimeout(resolve, 400));

  const translatedText = mockTranslate(text.trim());

  res.json({
    success: true,
    original: text.trim(),
    translated: translatedText,
    sourceLang,
    targetLang,
    provider: "mock",
    note: "This is a mock translation. Connect a real API (OpenAI / Google Translate) to get actual translations.",
  });
});

module.exports = router;
