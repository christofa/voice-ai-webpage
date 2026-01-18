import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  // 1️⃣ Get data from frontend
  const { text, systemPrompt } = await req.json();

  // 2️⃣ Ask Gemini to respond
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(
    `${systemPrompt}\nUser: ${text}`
  );

  const aiText = result.response.text();

  // 3️⃣ Convert AI text → speech (Deepgram)
  const ttsResponse = await fetch(
    "https://api.deepgram.com/v1/speak?model=aura-asteria-en",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: aiText }),
    }
  );

  const audioBuffer = await ttsResponse.arrayBuffer();

  // 4️⃣ Send audio back to frontend
  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "X-AI-Text": encodeURIComponent(aiText),
    },
  });
}
