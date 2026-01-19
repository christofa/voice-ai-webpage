"use client";

import { useEffect, useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
      console.log("🎤 Processing voice request, audio blob size:", audioBlob.size);
      
      // 1. Transcribe audio to text using STT
      console.log("📝 Sending audio to STT API...");
      const sttResponse = await fetch("/api/stt", {
        method: "POST",
        body: audioBlob,
      });

      if (!sttResponse.ok) {
        const errorText = await sttResponse.text();
        console.error("STT API error:", errorText);
        throw new Error(`Failed to transcribe audio: ${errorText}`);
      }

      const { text: userText } = await sttResponse.json();
      console.log("✅ Transcribed text:", userText);

      if (!userText || userText.trim() === "") {
        alert("No speech detected. Please try again.");
        return;
      }

      // 2. Get AI response and play audio
      console.log("🤖 Getting AI response...");
      const aiText = await handleVoiceAI(userText, bot);
      console.log("✅ AI response:", aiText);

      // 3. Save conversation to database
      console.log("💾 Saving conversation to database...");
      await saveConversation(bot.id, userText, aiText);
      console.log("✅ Conversation saved");
      
      // 4. Refresh conversation display
      console.log("🔄 Refreshing conversations...");
      await fetchConversations();
      console.log("✅ Conversations refreshed");
      
      // 5. Open modal to show conversation
      onOpen();
    } catch (error) {
      console.error("❌ Error processing voice request:", error);
      alert(`Failed to process voice request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      console.log("⏹️ Stopping recording...");
      mediaRecorder?.stop();
      setIsRecording(false);
      return;
    }

    try {
      console.log("🎙️ Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        console.log("📦 Audio chunk received, size:", e.data.size);
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        console.log("⏹️ Recording stopped, total chunks:", chunks.length);
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        console.log("🎵 Created audio blob, size:", audioBlob.size);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        await processVoiceRequest(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      console.log("✅ Recording started successfully");
    } catch (error) {
      console.error("❌ Error accessing microphone:", error);
      alert("Failed to access microphone. Please check permissions.");
    }
  };

  return (
    <>
      {/* Talk Button */}
      <Button
        size="sm"
        color={isRecording ? "danger" : "success"}
        onPress={toggleRecording}
        className="flex-1"
      >
        {isRecording ? "Stop Talking" : "Talk"}
      </Button>

      {/* View Conversation Button */}
      <Button
        size="sm"
        variant="flat"
        onPress={onOpen}
        className="flex-1"
        aria-label="View Conversation"
      >
        View Chat
      </Button>

      {/* Conversation Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Conversation with {bot.name}</h3>
                <p className="text-sm font-normal text-slate-600 dark:text-slate-400">
                  {messages.length} messages
                </p>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-100 dark:bg-blue-900/30 ml-auto max-w-[80%]"
                          : "bg-purple-100 dark:bg-purple-900/30 mr-auto max-w-[80%]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {msg.role === "user" ? "You" : bot.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(msg.created_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
