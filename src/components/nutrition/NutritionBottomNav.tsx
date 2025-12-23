import { Link, useLocation } from 'react-router-dom';
import { Activity, ScanLine, ClipboardList, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { 
    icon: Activity, 
    label: 'Status', 
    href: '/nutrition',
    exact: true
  },
  { 
    icon: ScanLine, 
    label: 'Scanner', 
    href: '/nutrition/scanner' 
  },
  { 
    icon: ClipboardList, 
    label: 'Log', 
    href: '/nutrition/log' 
  },
  { 
    icon: Settings, 
    label: 'Protocol', 
    href: '/nutrition/protocol' 
  },
];

export default function NutritionBottomNav() {
  const location = useLocation();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-zinc-800/50">
      {/* Safe area for iOS */}
      <div className="pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  active 
                    ? "text-cyan-400" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <div className={cn(
                  "relative",
                  active && "drop-shadow-[0_0_8px_hsl(186,100%,50%)]"
                )}>
                  <item.icon className="w-6 h-6" />
                  {active && (
                    <div className="absolute -inset-1 bg-cyan-400/20 rounded-full blur-sm -z-10" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium uppercase tracking-wider",
                  active && "text-cyan-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
