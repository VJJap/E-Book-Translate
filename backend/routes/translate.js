require("dotenv").config();
const express = require("express");
const { OpenAI } = require("openai");
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { text, sourceLang = "en", targetLang = "th" } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Translate the given text to Thai. Return ONLY the translated text, no explanations, no quotes.",
        },
        {
          role: "user",
          content: text.trim(),
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const translatedText = completion.choices[0].message.content.trim();

    res.json({
      success: true,
      original: text.trim(),
      translated: translatedText,
      sourceLang,
      targetLang,
      provider: "openai",
    });
  } catch (err) {
    console.error("OpenAI error:", err.message);
    res.status(500).json({ error: "Translation failed: " + err.message });
  }
});

module.exports = router;