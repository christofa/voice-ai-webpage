# 📌 ECHOBASE voice-ai-webpage

EchoBase is a modern voice-based AI assistant platform that lets users record audio, convert speech to text, generate meaningful AI responses, and play responses back as speech. It integrates a frontend dashboard to create and manage multiple “voice bots,” and stores past conversations for review. The system blends voice capture, AI language processing, Text-to-Speech synthesis, and conversation logging into a seamless experience.

---

## 🚀 Features

- 🎤 Real-time Speech-to-Text transcription
- 🤖 AI-powered response generation
- 🔊 Text-to-Speech playback
- 💬 Persistent conversation history
- 🗂️ Multi-bot management system
- ⚡ Fast API communication
- 🎨 Modern and responsive UI
- 🧩 Type-safe development with TypeScript

---

## 🛠️ Tech Stack

### AI & Voice Processing
- **Groq** – High-speed LLM inference
- **Deepgram** – Speech-to-Text transcription

### Backend & Database
- **Supabase** – Database and backend services
- **Axios** – API communication layer

### Frontend
- **Next.js 14** – Full-stack React framework
- **TypeScript** – Static typing for scalability
- **HeroUI** – Component library
- **TailwindCSS** – Utility-first styling

---

## 🧠 System Architecture Flow

1. User records voice input.
2. Audio is sent to Deepgram for transcription.
3. Transcribed text is sent to Groq for AI response generation.
4. AI response is returned to the frontend.
5. Text-to-speech playback is triggered.
6. Conversation data is stored in Supabase.

This architecture enables real-time, persistent, and scalable AI voice interaction.

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/christofa/voice-ai-webpage.git
cd voice-ai-webpage
```

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).
