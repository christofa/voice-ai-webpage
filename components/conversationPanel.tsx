"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { handleVoiceAI } from "@/lib/voice";
import { saveConversation } from "@/lib/conversations";

type Bot = {
  id: string;
  system_prompt: string;
  name: string;
  voice_id: string;
  created_at: string;
};

type Conversation = {
  id: string;
  bot_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type Props = {
  bot: Bot;
};

export default function ConversationPanel({ bot }: Props) {
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] =
    useState<MediaRecorder | null>(null);

  // 🔹 Load conversation on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const supabase = getSupabaseBrowserClient();

    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("bot_id", bot.id)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const processVoiceRequest = async () => {
    const userText = "Hello, how are you?"; // mock STT

    const aiText = await handleVoiceAI(userText, bot);

    await saveConversation(bot.id, userText, aiText);
    await fetchConversations();
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.onstop = processVoiceRequest;

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  return (
    <div className="mt-4 border-t pt-4">
      {/* Messages */}
      <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded text-sm ${
              msg.role === "user"
                ? "bg-slate-200 dark:bg-slate-700 text-right"
                : "bg-purple-200 dark:bg-purple-700"
            }`}
          >
            <p className="text-xs opacity-70">{msg.role}</p>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Talk Button */}
      <Button
        size="sm"
        color={isRecording ? "danger" : "success"}
        onPress={toggleRecording}
        className="w-full"
      >
        {isRecording ? "Stop Talking" : "Talk"}
      </Button>
    </div>
  );
}