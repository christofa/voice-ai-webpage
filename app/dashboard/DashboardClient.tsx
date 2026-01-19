"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { handleVoiceAI } from "@/lib/voice";
import { saveConversation } from "@/lib/conversations";
import ConversationPanel from "@/app/dashboard/conversationPanel";

type Bot = {
  id: string;
  name: string;
  system_prompt: string;
  voice_id: string;
  created_at: string;
};

const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable" },
  { value: "onyx", label: "Onyx" },
  { value: "nova", label: "Nova" },
  { value: "shimmer", label: "Shimmer" },
];

type DashboardClientProps = {
  user: User;
};

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  // Form state
  const [botName, setBotName] = useState("");
  const [systemInstructions, setSystemInstructions] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  /* ✅ FIX: Fetch bots on load */
  useEffect(() => {
    const fetchBots = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setBots(data);
    };

    fetchBots();
  }, [user.id]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const processVoiceRequest = async (audioBlob: Blob, bot: Bot) => {
    // 1️⃣ STT (mock for MVP)
    const userText = "Hello, how are you?";

    // 2️⃣ AI response + voice
    const aiText = await handleVoiceAI(userText, bot);

    // 3️⃣ Save conversation
    await saveConversation(bot.id, userText, aiText);
  };

  const toggleRecording = async (bot: Bot) => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      await processVoiceRequest(audioBlob, bot);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  /* ✅ FIX: Insert correct column names */
  const handleCreateBot = async () => {
    if (!botName || !systemInstructions || !selectedVoice) {
      alert("Please fill in all fields");
      return;
    }

    setIsCreating(true);
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("bots")
      .insert({
        user_id: user.id,
        name: botName,
        system_prompt: systemInstructions,
        voice_id: selectedVoice,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setIsCreating(false);
      return;
    }

    setBots((prev) => [data, ...prev]);

    setBotName("");
    setSystemInstructions("");
    setSelectedVoice("");
    setIsCreating(false);
    onOpenChange();
  };

  const handleDeleteBot = async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    
    const { error } = await supabase
      .from("bots")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting bot:", error);
      alert("Failed to delete bot. Please try again.");
      return;
    }

    setBots(bots.filter((bot) => bot.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}

      <header className="border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              EchoBase Dashboard
            </p>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Bots
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {user.email}
            </p>

            <Button
              color="danger"
              variant="flat"
              onPress={handleSignOut}
              isLoading={isSigningOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Create Bot Button */}

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Your Voice AI Bots
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Create and manage your AI voice assistants
            </p>
          </div>

          <Button
            size="lg"
            onPress={onOpen}
            className="font-semibold bg-purple-400/50"
          >
            + Create New Bot
          </Button>
        </div>

        {/* Bots Grid */}

        {bots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 text-6xl">🤖</div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No bots yet
              </h3>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first voice AI bot to get started
              </p>

              <Button className="bg-purple-400/50" onPress={onOpen}>
                Create Your First Bot
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card
                key={bot.id}
                className="border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-col items-start gap-2 pb-0">
                  <div className="flex w-full justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {bot.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {bot.name}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Voice: {bot.voice_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="pt-4">
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      System Instructions:
                    </p>

                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                      {bot.system_prompt}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => handleDeleteBot(bot.id)}
                      className="flex-1"
                    >
                      Delete
                    </Button>

                    <ConversationPanel bot={bot} />
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                    Created: {new Date(bot.created_at).toLocaleDateString()}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Bot Modal */}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold">Create New Bot</h2>

                <p className="text-sm font-normal text-slate-600 dark:text-slate-400">
                  Configure your AI voice assistant
                </p>
              </ModalHeader>

              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Bot Name"
                    placeholder="e.g., Customer Support Bot"
                    value={botName}
                    onValueChange={setBotName}
                    variant="bordered"
                    isRequired
                  />

                  <Textarea
                    label="System Instructions"
                    placeholder="Describe how your bot should behave. This is the 'brain' of your bot..."
                    value={systemInstructions}
                    onValueChange={setSystemInstructions}
                    variant="bordered"
                    minRows={6}
                    isRequired
                    description="These instructions guide how your AI bot responds and behaves"
                  />

                  <Select
                    label="Voice Selection"
                    placeholder="Select a voice"
                    variant="bordered"
                    selectedKeys={selectedVoice ? [selectedVoice] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      setSelectedVoice(selected);
                    }}
                    isRequired
                  >
                    {VOICE_OPTIONS.map((voice) => (
                      <SelectItem
                        key={voice.value}
                        {...({ value: voice.value } as any)}
                      >
                        {voice.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>

                <Button
                  color="primary"
                  onPress={handleCreateBot}
                  isLoading={isCreating}
                >
                  Create Bot
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
