import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioPost } from "./PortfolioGrid";

interface PortfolioViewerProps {
  post: PortfolioPost;
  initialMediaIndex: number;
  onClose: () => void;
}

export function PortfolioViewer({ post, initialMediaIndex, onClose }: PortfolioViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialMediaIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentMedia = post.media[currentIndex];
  const totalMedia = post.media.length;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Auto-play videos
  useEffect(() => {
    if (currentMedia.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [currentIndex, currentMedia.type]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalMedia - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < totalMedia - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && totalMedia > 1) {
      goToNext();
    } else if (isRightSwipe && totalMedia > 1) {
      goToPrevious();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex justify-between items-center">
          <div className="text-white text-sm">
            {currentIndex + 1} of {totalMedia}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex items-center justify-center h-full relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // Close on background click
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Navigation Arrows - Desktop */}
        {totalMedia > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="absolute left-4 z-10 text-white hover:bg-white/20 rounded-full p-2 hidden sm:flex"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="absolute right-4 z-10 text-white hover:bg-white/20 rounded-full p-2 hidden sm:flex"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Media Display */}
        <div className="max-w-full max-h-full flex items-center justify-center p-4">
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt="Portfolio item"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                src={currentMedia.url}
                muted={isMuted}
                loop
                controls={false}
                className="max-w-full max-h-full object-contain"
                playsInline
              />
              
              {/* Sound Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="absolute bottom-4 right-4 text-white hover:bg-white/20 rounded-full p-2"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      {totalMedia > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {post.media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}