import { NavLink } from "react-router-dom";
import { Home, Search, MessageCircle, User, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const MobileNav = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: "/feed", icon: Home, label: t('home') },
    { to: "/search", icon: Search, label: t('search') },
    { to: "/profile?tab=store", icon: Store, label: "My Store" },
    { to: "/messages", icon: MessageCircle, label: t('messages') },
    { to: "/profile", icon: User, label: t('profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/profile"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-slate-500 hover:text-primary hover:bg-slate-100"
              )
            }
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
