import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export async function saveConversation(
  botId: string,
  userText: string,
  aiText: string
) {
  const supabase = getSupabaseBrowserClient();

  await supabase.from("conversations").insert([
    { bot_id: botId, role: "user", content: userText },
    { bot_id: botId, role: "assistant", content: aiText },
  ]);
}
