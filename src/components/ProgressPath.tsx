import { CheckCircle, Lock, Play, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type PathNodeStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface PathNode {
  id: string;
  lessonNumber: number;
  title: string;
  status: PathNodeStatus;
  xpReward?: number;
}

interface ProgressPathProps {
  nodes: PathNode[];
  onNodeClick?: (node: PathNode) => void;
  className?: string;
}

const ProgressPath = ({ nodes, onNodeClick, className }: ProgressPathProps) => {
  const getNodeColor = (status: PathNodeStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-accent text-accent-foreground';
      case 'in_progress':
        return 'bg-primary text-primary-foreground animate-pulse';
      case 'available':
        return 'bg-primary/20 text-primary border-2 border-primary';
      case 'locked':
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNodeIcon = (status: PathNodeStatus, lessonNumber: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'in_progress':
        return <Play className="w-5 h-5" />;
      case 'locked':
        return <Lock className="w-4 h-4" />;
      default:
        return <span className="font-bold">{lessonNumber}</span>;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Path line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-primary to-muted" />

      {/* Nodes */}
      <div className="space-y-6">
        {nodes.map((node, index) => {
          const isLocked = node.status === 'locked';
          
          return (
            <div
              key={node.id}
              className={cn(
                "relative flex items-center gap-4",
                !isLocked && "cursor-pointer group"
              )}
              onClick={() => !isLocked && onNodeClick?.(node)}
            >
              {/* Node circle */}
              <div
                className={cn(
                  "relative z-10 w-12 h-12 rounded-full flex items-center justify-center",
                  "transition-all duration-300 shadow-md",
                  getNodeColor(node.status),
                  !isLocked && "group-hover:scale-110 group-hover:shadow-lg"
                )}
              >
                {getNodeIcon(node.status, node.lessonNumber)}
              </div>

              {/* Node content */}
              <div
                className={cn(
                  "flex-1 p-3 rounded-lg transition-all duration-300",
                  !isLocked && "group-hover:bg-card group-hover:shadow-soft",
                  isLocked && "opacity-60"
                )}
              >
                <h4 className="font-semibold text-foreground">{node.title}</h4>
                {node.xpReward && (
                  <span className="text-xs text-gold">+{node.xpReward} XP</span>
                )}
              </div>

              {/* Connector dot for completed items */}
              {node.status === 'completed' && index < nodes.length - 1 && (
                <div className="absolute left-5 -bottom-3 w-2 h-2 rounded-full bg-accent" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressPath;
