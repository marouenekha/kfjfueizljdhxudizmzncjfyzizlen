import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container-mobile">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {showMenu && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMenuClick}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold gradient-text">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showNotifications && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full text-xs flex items-center justify-center text-secondary-foreground">
                  3
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};