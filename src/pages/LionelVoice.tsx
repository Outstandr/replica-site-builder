import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConversation } from "@elevenlabs/react";
import { VoiceMicButton, VoiceState } from "@/components/lionel/VoiceMicButton";
import { VoiceChatHistory } from "@/components/lionel/VoiceChatHistory";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  isFinal?: boolean;
}

const LionelVoice = () => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Lionel Agent");
      toast.success("Connected to Lionel");
    },
    onDisconnect: () => {
      console.log("Disconnected from Lionel Agent");
    },
    onMessage: (message: unknown) => {
      console.log("Message received:", message);
      const msg = message as Record<string, unknown>;
      
      // Handle user transcripts
      if (msg.type === "user_transcript") {
        const event = msg.user_transcription_event as Record<string, unknown> | undefined;
        const transcript = event?.user_transcript as string | undefined;
        if (transcript) {
          setMessages((prev) => {
            // Check if we need to update the last user message or add new
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === "user" && !lastMsg.isFinal) {
              // Update the existing user message
              return prev.map((m, i) => 
                i === prev.length - 1 
                  ? { ...m, content: transcript, isFinal: true }
                  : m
              );
            }
            // Add new user message
            return [...prev, { role: "user", content: transcript, isFinal: true }];
          });
        }
      }
      
      // Handle agent responses
      if (msg.type === "agent_response") {
        const event = msg.agent_response_event as Record<string, unknown> | undefined;
        const response = event?.agent_response as string | undefined;
        if (response) {
          setMessages((prev) => [...prev, { role: "assistant", content: response, isFinal: true }]);
        }
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast.error("Connection error. Please try again.");
    },
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");

      if (error) {
        console.error("Error getting token:", error);
        throw new Error("Failed to get conversation token");
      }

      if (!data?.signed_url) {
        throw new Error("No signed URL received");
      }

      console.log("Starting conversation with signed URL");

      // Start the conversation with WebSocket
      await conversation.startSession({
        signedUrl: data.signed_url,
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      if (error instanceof Error && error.message.includes("Permission denied")) {
        toast.error("Microphone access denied. Please allow microphone access to speak with Lionel.");
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to connect to Lionel");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    setMessages([]);
  }, [conversation]);

  const handleButtonClick = useCallback(() => {
    if (conversation.status === "disconnected") {
      startConversation();
    }
  }, [conversation.status, startConversation]);

  // Map conversation status to our VoiceState
  const getVoiceState = (): VoiceState => {
    if (conversation.status === "disconnected") return "disconnected";
    if (conversation.isSpeaking) return "speaking";
    return "connected";
  };

  const getStatusText = () => {
    if (isConnecting) return "CONNECTING...";
    
    const state = getVoiceState();
    switch (state) {
      case "disconnected":
        return "START SESSION";
      case "connected":
        return "LISTENING...";
      case "speaking":
        return "LIONEL IS SPEAKING...";
      default:
        return "START SESSION";
    }
  };

  const voiceState = getVoiceState();

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
            Real-Time Voice Coach
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
            state={voiceState}
            onClick={handleButtonClick}
            disabled={isConnecting || conversation.status === "connected"}
          />
        </motion.div>

        {/* Status Text */}
        <motion.p
          key={voiceState + (isConnecting ? "-connecting" : "")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`font-mono text-sm tracking-widest ${
            voiceState === "connected"
              ? "text-amber-400"
              : voiceState === "speaking"
              ? "text-amber-300"
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

      {/* Footer with disconnect button */}
      <footer className="p-4 text-center border-t border-zinc-800/50">
        {conversation.status === "connected" ? (
          <button
            onClick={stopConversation}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-zinc-500 hover:text-red-400 transition-colors font-mono text-sm"
          >
            <X className="w-4 h-4" />
            <span>DISCONNECT</span>
          </button>
        ) : (
          <p className="text-zinc-600 text-xs font-light">
            {messages.length === 0
              ? "Speak your truth. Lionel will forge your path."
              : `${Math.ceil(messages.length / 2)} exchanges completed`}
          </p>
        )}
      </footer>
    </div>
  );
};

export default LionelVoice;
