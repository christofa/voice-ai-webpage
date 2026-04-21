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

<img width="960" height="517" alt="Screenshot 2026-04-21 034106" src="https://github.com/user-attachments/assets/914e5315-d01f-42f1-9c36-203f4dd2a9e9" />

<img width="950" height="509" alt="Screenshot 2026-04-21 034131" src="https://github.com/user-attachments/assets/c412c15d-c562-4f05-acad-35601dca4b2e" />

<img width="960" height="512" alt="Screenshot 2026-04-21 034212" src="https://github.com/user-attachments/assets/ef780ecd-60bf-4776-818b-aa988dc2c3f2" />


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
