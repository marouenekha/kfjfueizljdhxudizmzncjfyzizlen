import { NavLink, useNavigate } from "react-router-dom";
import { Home, Search, User, Plus, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export const DesktopSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { to: "/feed", icon: Home, label: t('home') },
    { to: "/search", icon: Search, label: t('search') },
    { to: "/profile", icon: User, label: t('profile') },
    { to: "/settings", icon: Settings, label: t('settings') },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-card px-4 py-6 shrink-0">
      {/* Brand */}
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold gradient-text">ServiceHub</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t('heroTitle')}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Create post CTA */}
      <div className="mt-4 space-y-2">
        <Button className="w-full" onClick={() => navigate("/create-post")}>
          <Plus className="w-4 h-4 mr-2" /> {t('createPost')}
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground justify-start gap-3 px-3" onClick={logout}>
          <LogOut className="w-4 h-4" /> {t('logout')}
        </Button>
      </div>
    </aside>
  );
};
