// import { Bot } from "@/types";

// export async function handleVoiceAI(
//   userText: string,
//   bot: Bot
// ): Promise<string> {
//   const response = await fetch("/api/voice", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       text: userText,
//       systemPrompt: bot.system_prompt,
//     }),
//   });

//   const audioBlob = await response.blob();
//   const aiText = decodeURIComponent(
//     response.headers.get("X-AI-Text") || ""
//   );

//   // Play audio
//   const audioUrl = URL.createObjectURL(audioBlob);
//   new Audio(audioUrl).play();

//   return aiText;
// }

import { Bot } from "@/types";

export async function handleVoiceAI(
  userText: string,
  bot: Bot
): Promise<string> {
  // Call backend Voice AI route
  const response = await fetch("/api/voice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: userText,
      systemPrompt: bot.system_prompt,
      voiceId: bot.voice_id, // ✅ REQUIRED for TTS
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    console.error("Voice AI API error:", errorData);
    throw new Error(`Voice AI request failed: ${errorData.error || response.statusText}`);
  }

  // Get AI voice audio
  const audioBlob = await response.blob();

  // Get AI text response from header
  const aiText = decodeURIComponent(
    response.headers.get("X-AI-Text") || ""
  );

  if (!aiText) {
    throw new Error("No AI text response received");
  }

  // Play audio in browser
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();

  return aiText;
}