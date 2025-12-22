import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label?: string;
  className?: string;
  position?: "bottom-right" | "bottom-center";
}

const FloatingActionButton = ({
  onClick,
  icon,
  label,
  className,
  position = "bottom-right",
}: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-40 flex items-center justify-center gap-2 rounded-full shadow-strong transition-all duration-300",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "active:scale-95 hover:scale-105",
        label ? "px-5 py-3" : "w-14 h-14",
        position === "bottom-right" && "bottom-24 right-4",
        position === "bottom-center" && "bottom-24 left-1/2 -translate-x-1/2",
        className
      )}
      style={{
        boxShadow: "0 8px 32px hsl(var(--primary) / 0.3)"
      }}
    >
      {icon}
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
};

export default FloatingActionButton;
