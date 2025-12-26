import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  isFinal?: boolean;
}

interface VoiceChatHistoryProps {
  messages: Message[];
}

export const VoiceChatHistory = ({ messages }: VoiceChatHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="h-[300px] w-full" ref={scrollRef}>
      <div className="space-y-4 px-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[85%] rounded-2xl px-4 py-3 font-mono text-sm
                ${
                  message.role === "user"
                    ? "bg-zinc-800 text-zinc-300 rounded-br-sm"
                    : "bg-amber-500/10 text-amber-100 border border-amber-500/20 rounded-bl-sm"
                }
                ${!message.isFinal && message.role === "user" ? "opacity-70 italic" : ""}
              `}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
              {message.role === "assistant" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-amber-500/60 uppercase tracking-wider">Lionel</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};
