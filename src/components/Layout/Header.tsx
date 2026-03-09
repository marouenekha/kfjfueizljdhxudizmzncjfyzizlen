import { Settings, LogOut } from "lucide-react";
import { NotificationsPopover } from "./NotificationsPopover";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title: string;
  showMenu?: boolean;
  showNotifications?: boolean;
  onMenuClick?: () => void;
}

export const Header = ({ 
  title, 
  showMenu = false, 
  showNotifications = true,
  onMenuClick 
}: HeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {showMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <h1 className="text-xl font-bold gradient-text">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {showNotifications && <NotificationsPopover />}
          </div>
        </div>
      </div>
    </header>
  );
};
