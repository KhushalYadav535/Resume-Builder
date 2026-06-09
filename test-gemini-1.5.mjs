import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Parse .env.local manually
const envContent = fs.readFileSync(".env.local", "utf8");
const lines = envContent.split("\n");
for (const line of lines) {
  const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.*)\s*$/);
  if (match) {
    process.env.GEMINI_API_KEY = match[1].trim();
  }
}

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testing with gemini-1.5-flash model...");

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello! Respond in exactly 5 words.");
    console.log("RESULT:", result.response.text().trim());
    console.log("STATUS: SUCCESS");
  } catch (err) {
    console.error("STATUS: FAILED");
    console.error("Error details:", err);
  }
}

run();
