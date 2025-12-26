import { useState, useCallback, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LionelCoachProps {
  userName?: string;
  currentModule?: string;
  progress?: number;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lionel-coach`;

const LionelCoach = ({ userName, currentModule, progress }: LionelCoachProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `${userName ? `${userName}. ` : ""}Stop. Before you say anything. Ask yourself one question. Are you here to change? Or are you here to feel good about thinking about change? Because I don't do comfort. I do results. The 3% who actually transform their lives. Is that you? Prove it. Tell me what's holding you back right now.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { play, stop, isPlaying, isLoading: audioLoading } = useAudioPlayer();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(async (userMessage: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    
    setMessages(newMessages);
    setIsLoading(true);
    stop(); // Stop any playing audio

    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > newMessages.length) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev.slice(0, newMessages.length), { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context: { userName, currentModule, progress },
        }),
      });

      if (!resp.ok || !resp.body) {
        const error = await resp.json().catch(() => ({}));
        throw new Error(error.error || "Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (const raw of buffer.split("\n")) {
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            // Ignore partial leftovers
          }
        }
      }

      // Play voice if enabled
      if (voiceEnabled && assistantContent.trim()) {
        play(assistantContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection lost. But that's not an excuse. Come back. Try again. Now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, userName, currentModule, progress, voiceEnabled, play, stop]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    streamChat(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (isPlaying) {
      stop();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg z-40",
          "bg-gradient-to-br from-zinc-900 to-zinc-800",
          "hover:scale-110 transition-transform border border-amber-500/30",
          isOpen && "hidden"
        )}
        size="icon"
      >
        <MessageCircle className="w-6 h-6 text-amber-500" />
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[500px] sm:max-h-[80vh] bg-zinc-950 rounded-2xl shadow-2xl border border-amber-500/20 z-50 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-amber-500/20 bg-gradient-to-r from-zinc-900 to-zinc-950">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center",
                (isPlaying || audioLoading) && "animate-pulse"
              )}>
                <Sparkles className="w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h3 className="font-bold text-amber-500">Lionel X</h3>
                <p className="text-xs text-zinc-500">
                  {isPlaying ? "Speaking..." : audioLoading ? "Preparing voice..." : "High-Performance Architect"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVoice}
                className={cn(
                  "hover:bg-amber-500/10",
                  voiceEnabled ? "text-amber-500" : "text-zinc-600"
                )}
                title={voiceEnabled ? "Disable voice" : "Enable voice"}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  stop();
                  setIsOpen(false);
                }}
                className="hover:bg-red-500/10 text-zinc-500 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                      message.role === "user"
                        ? "bg-amber-600 text-zinc-900 font-medium rounded-br-md"
                        : "bg-zinc-900 text-zinc-200 rounded-bl-md border border-zinc-800"
                    )}
                  >
                    {message.content.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 rounded-2xl rounded-bl-md px-4 py-2 border border-zinc-800">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-amber-500/20 bg-zinc-900/50">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Speak your truth..."
                className="min-h-[44px] max-h-32 resize-none bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-amber-500/50"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0 bg-amber-600 hover:bg-amber-700 text-zinc-900"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LionelCoach;
