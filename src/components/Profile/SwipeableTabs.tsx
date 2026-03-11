import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  key: string;
  label: string;
}

interface SwipeableTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children: React.ReactNode;
}

export const SwipeableTabs = ({ tabs, activeTab, onTabChange, children }: SwipeableTabsProps) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;
  const activeIndex = tabs.findIndex(t => t.key === activeTab);

  // Scroll active tab into view
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeEl = tabsContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    if (isSwipe) {
      if (distance > 0 && activeIndex < tabs.length - 1) {
        onTabChange(tabs[activeIndex + 1].key);
      } else if (distance < 0 && activeIndex > 0) {
        onTabChange(tabs[activeIndex - 1].key);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div className="relative border-b border-border">
        <div
          ref={tabsContainerRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex-shrink-0 snap-center px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
                "min-w-[33.333%] text-center",
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full transition-all" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content area with swipe */}
      <div
        ref={contentRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="mt-4 min-h-[200px]"
      >
        {children}
      </div>
    </div>
  );
};
