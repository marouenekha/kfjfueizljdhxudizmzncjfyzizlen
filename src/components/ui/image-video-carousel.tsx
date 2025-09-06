import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface ImageVideoCarouselProps {
  items: MediaItem[];
  className?: string;
}

export const ImageVideoCarousel: React.FC<ImageVideoCarouselProps> = ({ 
  items, 
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`relative ${className}`}>
      <AspectRatio ratio={16 / 9}>
        {currentItem.type === 'image' ? (
          <img 
            src={currentItem.url} 
            alt={`Media ${currentIndex + 1}`}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              src={currentItem.url}
              controls={isPlaying}
              className="w-full h-full object-cover rounded-lg"
              autoPlay={isPlaying}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
            {!isPlaying && (
              <Button
                onClick={togglePlayPause}
                size="icon"
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/50 hover:bg-black/70"
              >
                <Play className="w-6 h-6 text-white" />
              </Button>
            )}
          </div>
        )}
      </AspectRatio>

      {/* Navigation arrows */}
      {items.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            size="icon"
            variant="outline"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={goToNext}
            size="icon"
            variant="outline"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-primary' 
                  : 'bg-background/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};