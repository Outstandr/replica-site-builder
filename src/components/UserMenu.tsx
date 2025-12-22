import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings, Trophy, Flame, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  streak?: number;
  xp?: number;
}

const UserMenu = ({ streak = 0, xp = 0 }: UserMenuProps) => {
  const { user, signOut } = useAuth();
  const translations = useTranslations();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Stats */}
      <div className="hidden md:flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500">
          <Flame className="w-4 h-4" />
          <span className="font-semibold">{streak}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 text-gold">
          <Trophy className="w-4 h-4" />
          <span className="font-semibold">{xp.toLocaleString()}</span>
        </div>
      </div>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(user?.email)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2">
            <p className="font-medium text-foreground truncate">
              {user?.email}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                {streak} day streak
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-gold" />
                {xp} XP
              </span>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              {translations.common.profile}
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              {translations.common.dashboard}
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="flex items-center gap-2 cursor-pointer text-destructive"
          >
            <LogOut className="w-4 h-4" />
            {translations.common.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
