import { NavLink, useNavigate } from "react-router-dom";
import { Home, Search, MessageCircle, User, Plus, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/feed", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const DesktopSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-card px-4 py-6 shrink-0">
      {/* Brand */}
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold gradient-text">ServiceHub</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Local services marketplace</p>
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
          <Plus className="w-4 h-4 mr-2" /> Create Post
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground justify-start gap-3 px-3" onClick={logout}>
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </aside>
  );
};
