import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { DesktopSidebar } from "./DesktopSidebar";

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
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — only shown on md+ */}
      <DesktopSidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header — hidden on desktop */}
        {showHeader && (
          <div className="md:hidden">
            <Header title={title} showMenu={showMenu} />
          </div>
        )}

        <main className={`flex-1 ${showMobileNav ? 'pb-20 md:pb-0' : ''}`}>
          {children}
        </main>

        {/* Mobile bottom nav — hidden on desktop */}
        {showMobileNav && (
          <div className="md:hidden">
            <MobileNav />
          </div>
        )}
      </div>
    </div>
  );
};
