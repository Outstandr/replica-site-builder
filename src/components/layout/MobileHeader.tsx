import { ReactNode } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  backPath?: string;
  onBack?: () => void;
  showLogo?: boolean;
  rightContent?: ReactNode;
  accentColor?: string;
  className?: string;
}

const MobileHeader = ({
  title,
  subtitle,
  backPath,
  onBack,
  showLogo = false,
  rightContent,
  accentColor,
  className,
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-top",
        className
      )}
      style={accentColor ? { 
        backgroundColor: `${accentColor}08`,
        borderColor: `${accentColor}20`
      } : undefined}
    >
      <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {(backPath || onBack) && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="shrink-0 -ml-2 h-10 w-10 rounded-full hover:bg-muted/80 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          
          {showLogo && (
            <Sparkles className="w-6 h-6 text-primary shrink-0" />
          )}
          
          <div className="min-w-0 flex-1">
            <h1 
              className="text-lg font-bold text-foreground truncate"
              style={accentColor ? { color: accentColor } : undefined}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {rightContent && (
          <div className="shrink-0 ml-2">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
