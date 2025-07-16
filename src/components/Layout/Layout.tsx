import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

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
    <div className="min-h-screen bg-background">
      {showHeader && (
        <Header 
          title={title} 
          showMenu={showMenu}
        />
      )}
      
      <main className={`${showMobileNav ? 'pb-20' : ''} ${showHeader ? 'pt-0' : ''}`}>
        {children}
      </main>

      {showMobileNav && <MobileNav />}
    </div>
  );
};