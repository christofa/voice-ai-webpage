import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export async function saveConversation(
  botId: string,
  userText: string,
  aiText: string
) {
  console.log("💾 Attempting to save conversation:", { botId, userText, aiText });
  
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.from("conversations").insert([
    { bot_id: botId, role: "user", content: userText },
    { bot_id: botId, role: "assistant", content: aiText },
  ]).select();

  if (error) {
    console.error("❌ Error saving conversation:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to save conversation: ${error.message}`);
  }

  console.log("✅ Conversation saved successfully:", data);
  return data;
}
