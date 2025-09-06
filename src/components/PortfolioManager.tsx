import { useState } from "react";
import { Plus, Upload, X, Image, Video } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { PortfolioGrid } from "@/components/PortfolioGrid";

interface PortfolioManagerProps {
  userId: string;
  isOwnProfile: boolean;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({ userId, isOwnProfile }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploadMultipleImages, uploading } = useImageUpload('portfolio');
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isVideo, setIsVideo] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const file = files[0];
    
    if (!file) return;

    // Check if it's a video
    if (file.type.startsWith('video/')) {
      setIsVideo(true);
    } else {
      setIsVideo(false);
    }

    setSelectedFiles([file]);
  };

  const validateImage = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const maxWidth = 1000;
        const maxHeight = 1000;
        
        if (img.width > maxWidth || img.height > maxHeight) {
          resolve(`Image is too large. Maximum size: ${maxWidth}px × ${maxHeight}px. Current size: ${img.width}px × ${img.height}px`);
        } else {
          resolve(null);
        }
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!user || !title.trim() || selectedFiles.length === 0) return;

    // Validate image size if not video
    if (!isVideo) {
      const validationError = await validateImage(selectedFiles[0]);
      if (validationError) {
        toast({
          title: "Image too large",
          description: validationError,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      let mediaUrl = '';
      
      if (isVideo) {
        // Upload video
        mediaUrl = await uploadImage(selectedFiles[0]) || '';
      } else {
        // Upload image
        mediaUrl = await uploadImage(selectedFiles[0]) || '';
      }

      if (!mediaUrl) {
        throw new Error('Failed to upload file');
      }

      const { error } = await supabase
        .from('portfolio_items')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          [isVideo ? 'video_url' : 'image_url']: mediaUrl,
        });

      if (error) throw error;

      toast({
        title: "Portfolio item added",
        description: "Your portfolio has been updated successfully.",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFiles([]);
      setIsVideo(false);
      setShowDialog(false);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Item Button (only for own profile) */}
      {isOwnProfile && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Portfolio Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter item title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your work"
                  rows={3}
                />
              </div>

              {/* File Upload */}
              <div>
                <Label>Media</Label>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {selectedFiles.length > 0 ? (
                          <>
                            {isVideo ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                            <span>{selectedFiles[0].name}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Select image or video</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedFiles([]);
                        setIsVideo(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max image size: 1000px × 1000px. Videos will be auto-cropped to proper aspect ratio.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={uploading || !title.trim() || selectedFiles.length === 0}
                  className="flex-1"
                >
                  {uploading ? "Uploading..." : "Add Item"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Portfolio Grid */}
      <PortfolioGrid 
        userId={userId} 
        isOwnProfile={isOwnProfile}
        userName={user?.profile?.name || "User"}
        userAvatar={user?.profile?.avatar_url}
      />
    </div>
  );
};