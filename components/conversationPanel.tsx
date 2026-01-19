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
  }, [bot.id]);

  const fetchConversations = async () => {
    const supabase = getSupabaseBrowserClient();

    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("bot_id", bot.id)
      .order("created_at", { ascending: true });

    if (data) setMessages(data as Conversation[]);
  };

  const processVoiceRequest = async (audioBlob: Blob) => {
    try {
      // 1. Transcribe audio to text using STT
      const sttResponse = await fetch("/api/stt", {
        method: "POST",
        body: audioBlob,
      });

      if (!sttResponse.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const { text: userText } = await sttResponse.json();

      if (!userText || userText.trim() === "") {
        alert("No speech detected. Please try again.");
        return;
      }

      // 2. Get AI response and play audio
      const aiText = await handleVoiceAI(userText, bot);

      // 3. Save conversation to database
      await saveConversation(bot.id, userText, aiText);
      
      // 4. Refresh conversation display
      await fetchConversations();
    } catch (error) {
      console.error("Error processing voice request:", error);
      alert("Failed to process voice request. Please try again.");
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await processVoiceRequest(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Failed to access microphone. Please check permissions.");
    }
  };

  return (
    <>
      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto mb-3 mt-4 border-t pt-4">
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
      )}

      {/* Talk Button */}
      <Button
        size="sm"
        color={isRecording ? "danger" : "success"}
        onPress={toggleRecording}
        className="flex-1"
      >
        {isRecording ? "Stop Talking" : "Talk"}
      </Button>
    </>
  );
}