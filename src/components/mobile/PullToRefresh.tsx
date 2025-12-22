import { ReactNode, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

const PullToRefresh = ({ onRefresh, children, className }: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <div className={cn("relative", className)}>
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 flex justify-center py-4 z-10">
          <div className="p-2 rounded-full bg-background/90 backdrop-blur shadow-md">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          </div>
        </div>
      )}
      
      <div className={cn(isRefreshing && "opacity-50 pointer-events-none transition-opacity")}>
        {children}
      </div>
      
      {/* Manual refresh button for browsers that don't support pull-to-refresh */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="sr-only"
        aria-label="Refresh content"
      >
        Refresh
      </button>
    </div>
  );
};

export default PullToRefresh;
