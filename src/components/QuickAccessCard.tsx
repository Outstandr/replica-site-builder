import { Link } from "react-router-dom";
import { ChevronRight, LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  gradient?: string;
  className?: string;
  featured?: boolean;
}

const QuickAccessCard = ({
  title,
  description,
  icon: Icon,
  href,
  color,
  gradient,
  className,
  featured = false,
}: QuickAccessCardProps) => {
  return (
    <Link to={href} className={cn("block", className)}>
      <div 
        className={cn(
          "relative overflow-hidden rounded-2xl",
          featured ? "p-6" : "p-5",
          "bg-card/80 backdrop-blur-sm",
          featured 
            ? "border-2 border-primary/40 shadow-lg shadow-primary/10" 
            : "border border-border/50 shadow-soft hover:shadow-medium",
          "hover:scale-[1.02] active:scale-[0.98] transition-all",
          "group"
        )}
      >
        {/* Gradient overlay */}
        {gradient && (
          <div 
            className={cn(
              "absolute inset-0 transition-opacity",
              featured ? "opacity-20 group-hover:opacity-30" : "opacity-10 group-hover:opacity-20"
            )}
            style={{ background: gradient }}
          />
        )}

        {/* Featured glow effect */}
        {featured && (
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors" />
        )}
        
        <div className="relative flex items-center gap-4">
          <div 
            className={cn(
              "rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform",
              featured ? "w-16 h-16" : "w-14 h-14"
            )}
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className={cn(featured ? "w-8 h-8" : "w-7 h-7")} style={{ color }} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn("font-bold text-foreground", featured ? "text-xl" : "text-lg")}>{title}</h3>
              {featured && <Sparkles className="w-4 h-4 text-primary animate-pulse" />}
            </div>
            <p className={cn("text-muted-foreground truncate", featured ? "text-sm" : "text-sm")}>{description}</p>
          </div>
          
          <ChevronRight 
            className={cn(
              "text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0",
              featured ? "w-6 h-6" : "w-5 h-5"
            )} 
          />
        </div>
      </div>
    </Link>
  );
};

export default QuickAccessCard;
