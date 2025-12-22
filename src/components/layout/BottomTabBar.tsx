import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Library, PenTool, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";

interface TabItem {
  path: string;
  icon: React.ElementType;
  labelKey: keyof ReturnType<typeof useTranslations>["nav"];
}

const tabs: TabItem[] = [
  { path: "/dashboard", icon: Home, labelKey: "home" },
  { path: "/modules", icon: BookOpen, labelKey: "modules" },
  { path: "/masterclasses", icon: Library, labelKey: "masterclasses" },
  { path: "/journal", icon: PenTool, labelKey: "journal" },
  { path: "/profile", icon: User, labelKey: "profile" },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useTranslations();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-[64px]",
                "active:scale-95",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all duration-300",
                active && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  active && "scale-110"
                )} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                active ? "opacity-100" : "opacity-70"
              )}>
                {t.nav[tab.labelKey] || tab.labelKey}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
