import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get data from frontend
    const { text, systemPrompt, voiceId } = await req.json();

    console.log("🎯 Voice API called with:", { text, systemPrompt, voiceId });

    // 2️⃣ Ask Groq (Llama) to respond
    console.log("🤖 Calling Groq AI...");
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Free, fast, and powerful
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      max_tokens: 1024,
    });

    const aiText = completion.choices[0]?.message?.content || "";
    console.log("✅ Groq response:", aiText);

    // 3️⃣ Convert AI text → speech (Deepgram)
    // Map OpenAI voice names to Deepgram models
    const voiceModelMap: Record<string, string> = {
      alloy: "aura-asteria-en",
      echo: "aura-luna-en",
      fable: "aura-stella-en",
      onyx: "aura-athena-en",
      nova: "aura-hera-en",
      shimmer: "aura-orion-en",
    };

    const deepgramModel = voiceModelMap[voiceId] || "aura-asteria-en";
    console.log("🎵 Converting to speech with model:", deepgramModel);

    const ttsResponse = await fetch(
      `https://api.deepgram.com/v1/speak?model=${deepgramModel}`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: aiText }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("❌ Deepgram TTS error:", errorText);
      throw new Error(`Deepgram TTS failed: ${ttsResponse.statusText}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    console.log("✅ Audio generated, size:", audioBuffer.byteLength);

    // 4️⃣ Send audio back to frontend
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "X-AI-Text": encodeURIComponent(aiText),
      },
    });
  } catch (error) {
    console.error("❌ Voice API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Voice AI request failed" },
      { status: 500 }
    );
  }
}
