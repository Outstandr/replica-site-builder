import { Link } from "react-router-dom";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  gradient?: string;
  className?: string;
}

const QuickAccessCard = ({
  title,
  description,
  icon: Icon,
  href,
  color,
  gradient,
  className,
}: QuickAccessCardProps) => {
  return (
    <Link to={href} className={cn("block", className)}>
      <div 
        className={cn(
          "relative overflow-hidden rounded-2xl p-5",
          "bg-card/80 backdrop-blur-sm border border-border/50",
          "hover:scale-[1.02] active:scale-[0.98] transition-all",
          "group shadow-soft hover:shadow-medium"
        )}
      >
        {/* Gradient overlay */}
        {gradient && (
          <div 
            className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
            style={{ background: gradient }}
          />
        )}
        
        <div className="relative flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-7 h-7" style={{ color }} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          </div>
          
          <ChevronRight 
            className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" 
          />
        </div>
      </div>
    </Link>
  );
};

export default QuickAccessCard;
