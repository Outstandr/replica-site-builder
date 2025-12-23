import { useState } from "react";
import { Sparkles, RefreshCw, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DailyFocusProps {
  className?: string;
}

const reflectionPrompts = [
  "What does your body need most today?",
  "What thought pattern no longer serves you?",
  "How can you bring more presence to this moment?",
  "What would self-compassion look like for you today?",
  "Where in your life are you resisting change?",
  "What small step can you take toward your wellbeing?",
  "How can you honor your energy levels today?",
  "What boundary do you need to reinforce?",
];

const DailyFocus = ({ className }: DailyFocusProps) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(
    Math.floor(Math.random() * reflectionPrompts.length)
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentPromptIndex((prev) => 
        (prev + 1) % reflectionPrompts.length
      );
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20",
        "border border-primary/20",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Daily Reflection</h3>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="New prompt"
          >
            <RefreshCw 
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isRefreshing && "animate-spin"
              )} 
            />
          </button>
        </div>

        <p 
          className={cn(
            "text-lg text-foreground font-medium leading-relaxed mb-6 min-h-[3.5rem]",
            "transition-opacity duration-300",
            isRefreshing ? "opacity-0" : "opacity-100"
          )}
        >
          "{reflectionPrompts[currentPromptIndex]}"
        </p>

        <Link to="/journal">
          <Button 
            className={cn(
              "w-full h-12 rounded-full font-semibold",
              "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
              "hover:opacity-90 transition-opacity",
              "flex items-center justify-center gap-2"
            )}
          >
            <PenLine className="w-4 h-4" />
            <span>Write in Journal</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DailyFocus;
