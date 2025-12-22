import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  variant?: "default" | "lesson" | "module" | "stat";
  className?: string;
}

const SkeletonCard = ({ variant = "default", className }: SkeletonCardProps) => {
  if (variant === "lesson") {
    return (
      <div className={cn(
        "p-4 rounded-xl border-2 border-border/50 bg-card/50 animate-pulse",
        className
      )}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "module") {
    return (
      <div className={cn(
        "rounded-2xl border-2 border-border/50 p-6 bg-card/50 animate-pulse",
        className
      )}>
        <div className="w-12 h-12 rounded-xl bg-muted mb-4" />
        <div className="h-5 bg-muted rounded w-2/3 mb-2" />
        <div className="h-4 bg-muted rounded w-full mb-4" />
        <div className="flex justify-between items-center">
          <div className="h-3 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted" />
      </div>
    );
  }

  if (variant === "stat") {
    return (
      <div className={cn(
        "p-4 rounded-xl bg-card/50 border border-border/50 animate-pulse",
        className
      )}>
        <div className="w-8 h-8 rounded-lg bg-muted mb-2" />
        <div className="h-6 bg-muted rounded w-1/2 mb-1" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 rounded-xl border border-border/50 bg-card/50 animate-pulse",
      className
    )}>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
    </div>
  );
};

export default SkeletonCard;
