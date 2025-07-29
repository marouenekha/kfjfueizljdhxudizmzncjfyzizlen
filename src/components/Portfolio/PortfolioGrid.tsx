import { useState } from "react";
import { Play } from "lucide-react";
import { PortfolioUpload } from "./PortfolioUpload";
import { PortfolioViewer } from "./PortfolioViewer";

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface PortfolioPost {
  id: string;
  media: MediaFile[];
  createdAt: string;
}

interface PortfolioGridProps {
  posts: PortfolioPost[];
  onUpload: (files: File[]) => void;
}

export function PortfolioGrid({ posts, onUpload }: PortfolioGridProps) {
  const [selectedPost, setSelectedPost] = useState<PortfolioPost | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const handleMediaClick = (post: PortfolioPost, mediaIndex: number = 0) => {
    setSelectedPost(post);
    setSelectedMediaIndex(mediaIndex);
  };

  const closeViewer = () => {
    setSelectedPost(null);
    setSelectedMediaIndex(0);
  };

  return (
    <>
      <div className="relative">
        {/* Upload Button */}
        <PortfolioUpload onUpload={onUpload} />
        
        {/* Grid Layout - Instagram Style */}
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => {
            const firstMedia = post.media[0];
            if (!firstMedia) return null;

            return (
              <div
                key={post.id}
                className="relative aspect-square bg-muted rounded-sm overflow-hidden cursor-pointer group"
                onClick={() => handleMediaClick(post)}
              >
                {/* Main Image/Video Thumbnail */}
                <img
                  src={firstMedia.thumbnail || firstMedia.url}
                  alt="Portfolio item"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                {/* Video Indicator */}
                {firstMedia.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-2">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                )}

                {/* Multiple Media Indicator */}
                {post.media.length > 1 && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/70 rounded-full p-1">
                      <div className="grid grid-cols-2 gap-0.5">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Play className="w-6 h-6" />
            </div>
            <p className="text-sm mb-2">No portfolio items yet</p>
            <p className="text-xs">Upload your first photos or videos to showcase your work</p>
          </div>
        )}
      </div>

      {/* Full-Screen Viewer */}
      {selectedPost && (
        <PortfolioViewer
          post={selectedPost}
          initialMediaIndex={selectedMediaIndex}
          onClose={closeViewer}
        />
      )}
    </>
  );
}