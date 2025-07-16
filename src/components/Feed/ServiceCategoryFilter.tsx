import { Home, Monitor, PartyPopper, Sparkles, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServiceCategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories = [
  { id: "home", label: "Home", icon: Home, color: "service-home" },
  { id: "digital", label: "Digital", icon: Monitor, color: "service-digital" },
  { id: "events", label: "Events", icon: PartyPopper, color: "service-events" },
  { id: "wellness", label: "Wellness", icon: Sparkles, color: "service-wellness" },
  { id: "business", label: "Business", icon: Briefcase, color: "service-business" },
];

export const ServiceCategoryFilter = ({ 
  selectedCategory, 
  onCategoryChange 
}: ServiceCategoryFilterProps) => {
  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 py-3 border-b border-border">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="whitespace-nowrap flex-shrink-0"
        >
          All Services
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "whitespace-nowrap flex-shrink-0 flex items-center gap-2",
              selectedCategory === category.id && `bg-${category.color} hover:bg-${category.color}/90`
            )}
          >
            <category.icon className="w-4 h-4" />
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
};