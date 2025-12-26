import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceChatHistoryProps {
  messages: Message[];
}

export const VoiceChatHistory = ({ messages }: VoiceChatHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="flex-1 w-full max-w-2xl" ref={scrollRef}>
      <div className="space-y-4 p-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[85%] rounded-2xl px-4 py-3
                  ${
                    message.role === "user"
                      ? "bg-amber-500/20 text-amber-100 border border-amber-500/30"
                      : "bg-zinc-800/80 text-zinc-100 border border-zinc-700/50"
                  }
                `}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-mono text-amber-500/80 uppercase tracking-wider">
                      Lionel X
                    </span>
                  </div>
                )}
                <p className="text-sm leading-relaxed font-light">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};
