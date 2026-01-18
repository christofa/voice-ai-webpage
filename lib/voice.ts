import { Bot } from "@/types";

export async function handleVoiceAI(
  userText: string,
  bot: Bot
): Promise<string> {
  const response = await fetch("/api/voice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: userText,
      systemPrompt: bot.system_prompt,
    }),
  });

  const audioBlob = await response.blob();
  const aiText = decodeURIComponent(
    response.headers.get("X-AI-Text") || ""
  );

  // Play audio
  const audioUrl = URL.createObjectURL(audioBlob);
  new Audio(audioUrl).play();

  return aiText;
}
