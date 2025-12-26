import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VoiceMicButton, VoiceState } from "@/components/lionel/VoiceMicButton";
import { VoiceChatHistory } from "@/components/lionel/VoiceChatHistory";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-lionel`;

const LionelVoice = () => {
  const navigate = useNavigate();
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useVoiceRecorder();

  // Handle sending audio to the edge function
  const sendAudioToLionel = useCallback(async (blob: Blob) => {
    setVoiceState("processing");

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("history", JSON.stringify(messages));

      const response = await fetch(CHAT_FUNCTION_URL, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from Lionel");
      }

      const { userText, lionelText, audioBase64 } = await response.json();

      // Update chat history
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userText },
        { role: "assistant", content: lionelText },
      ]);

      // Play audio response
      setVoiceState("playing");
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setVoiceState("idle");
        audioRef.current = null;
      };

      audio.onerror = () => {
        console.error("Audio playback error");
        setVoiceState("idle");
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error("Error communicating with Lionel:", error);
      toast.error(error instanceof Error ? error.message : "Failed to communicate with Lionel");
      setVoiceState("idle");
    } finally {
      clearRecording();
    }
  }, [messages, clearRecording]);

  // Handle mic button click
  const handleMicClick = useCallback(async () => {
    if (voiceState === "processing" || voiceState === "playing") {
      return;
    }

    if (isRecording) {
      // Stop recording and send
      stopRecording();
    } else {
      // Start recording
      try {
        await startRecording();
      } catch (error) {
        toast.error("Microphone access denied. Please allow microphone access to speak with Lionel.");
      }
    }
  }, [voiceState, isRecording, startRecording, stopRecording]);

  // When recording stops and we have audio, send it
  const prevAudioBlobRef = useRef<Blob | null>(null);
  if (audioBlob && audioBlob !== prevAudioBlobRef.current && voiceState === "idle") {
    prevAudioBlobRef.current = audioBlob;
    sendAudioToLionel(audioBlob);
  }

  // Update voice state based on recording status
  const currentState: VoiceState = isRecording ? "recording" : voiceState;

  // Get status text
  const getStatusText = () => {
    switch (currentState) {
      case "recording":
        return "LISTENING...";
      case "processing":
        return "PROCESSING...";
      case "playing":
        return "LIONEL IS SPEAKING...";
      default:
        return "TAP TO SPEAK";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-zinc-800/50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-mono text-sm">BACK</span>
        </button>
        <div className="flex items-center gap-2 text-amber-500/80">
          <Zap className="w-4 h-4" />
          <span className="font-mono text-xs tracking-wider">GOD MODE</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-mono text-3xl font-bold text-amber-500 tracking-wider mb-2">
            LIONEL X
          </h1>
          <p className="text-zinc-500 text-sm font-light tracking-wide">
            High-Performance Voice Coach
          </p>
        </motion.div>

        {/* Mic Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <VoiceMicButton
            state={currentState}
            onClick={handleMicClick}
            disabled={voiceState === "processing" || voiceState === "playing"}
          />
        </motion.div>

        {/* Status Text */}
        <motion.p
          key={currentState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`font-mono text-sm tracking-widest ${
            currentState === "recording"
              ? "text-red-500"
              : currentState === "playing"
              ? "text-amber-400"
              : "text-zinc-500"
          }`}
        >
          {getStatusText()}
        </motion.p>

        {/* Chat History */}
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl flex-1 min-h-0"
          >
            <div className="border-t border-zinc-800/50 pt-4">
              <h3 className="font-mono text-xs text-zinc-600 uppercase tracking-wider mb-4 px-4">
                Session History
              </h3>
              <VoiceChatHistory messages={messages} />
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer instruction */}
      <footer className="p-4 text-center border-t border-zinc-800/50">
        <p className="text-zinc-600 text-xs font-light">
          {messages.length === 0
            ? "Speak your truth. Lionel will forge your path."
            : `${messages.length / 2} exchanges completed`}
        </p>
      </footer>
    </div>
  );
};

export default LionelVoice;
