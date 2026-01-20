import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.0-pro", // ✅ ONLY STABLE MODEL
});

export async function generateQuiz(content) {
  try {
    const prompt = `
Generate 5 multiple-choice questions from the content below.

Rules:
- Each question must have:
  - question
  - options (array of 4 strings)
  - correctAnswer (string)
- Return ONLY valid JSON
- No markdown
- No explanation

Content:
${content}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Safe JSON extraction
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("AI did not return valid JSON");
    }

    return JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    console.error("Gemini error:", err.message);
    throw err;
  }
}
