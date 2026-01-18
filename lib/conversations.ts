import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export async function saveConversation(
  botId: string,
  userText: string,
  aiText: string
) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.from("conversations").insert([
    { bot_id: botId, role: "user", content: userText },
    { bot_id: botId, role: "assistant", content: aiText },
  ]).select();

  if (error) {
    console.error("Error saving conversation:", error.message, error.details, error.hint);
    throw new Error(`Failed to save conversation: ${error.message}`);
  }

  return data;
}
