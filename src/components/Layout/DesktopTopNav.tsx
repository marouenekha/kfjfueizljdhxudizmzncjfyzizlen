import { NavLink, useNavigate } from "react-router-dom";
import { Home, Search, MessageCircle, User, Plus, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsPopover } from "./NotificationsPopover";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DesktopTopNav = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { to: "/feed", icon: Home, label: t('home') },
    { to: "/search", icon: Search, label: t('search') },
    { to: "/messages", icon: MessageCircle, label: t('messages') },
    { to: "/profile", icon: User, label: t('profile') },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 flex items-center h-14 gap-6">
        {/* Brand */}
        <button onClick={() => navigate("/feed")} className="shrink-0 mr-2">
          <h1 className="text-xl font-bold gradient-text">ServiceHub</h1>
        </button>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate("/create-post")}>
            <Plus className="w-4 h-4 mr-1" /> {t('post')}
          </Button>

          <NotificationsPopover />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
