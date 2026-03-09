import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { DesktopTopNav } from "./DesktopTopNav";

interface LayoutProps {
  children: ReactNode;
  title: string;
  showHeader?: boolean;
  showMobileNav?: boolean;
  showMenu?: boolean;
}

export const Layout = ({ 
  children, 
  title, 
  showHeader = true, 
  showMobileNav = true,
  showMenu = false 
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop top navbar */}
      <DesktopTopNav />

      {/* Mobile header */}
      {showHeader && (
        <div className="md:hidden">
          <Header title={title} showMenu={showMenu} />
        </div>
      )}

      <main className={`flex-1 ${showMobileNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      {showMobileNav && (
        <div className="md:hidden">
          <MobileNav />
        </div>
      )}
    </div>
  );
};
