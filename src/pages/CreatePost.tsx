import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageCropper } from "@/components/ui/image-cropper";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Wrench, ImageIcon, Video, Images, X, ChevronLeft, Loader2 
} from "lucide-react";

type PostType = "find" | "provide";
type MediaType = "image" | "video" | "carousel";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload("posts");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [postType, setPostType] = useState<PostType | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Crop queue state
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [cropQueueFiles, setCropQueueFiles] = useState<File[]>([]);
  const [cropIndex, setCropIndex] = useState(0);
  const [cropperOpen, setCropperOpen] = useState(false);

  const MAX_CHARS = 500;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const selectedFiles = mediaType === "image" ? [files[0]] : files;
    const urls = selectedFiles.map(f => URL.createObjectURL(f));

    setCropQueueFiles(selectedFiles);
    setCropQueue(urls);
    setCropIndex(0);
    setCropperOpen(true);

    e.target.value = "";
  };

  const handleCropComplete = (blob: Blob) => {
    const file = new File([blob], `cropped-${Date.now()}-${cropIndex}.jpg`, { type: "image/jpeg" });
    const preview = URL.createObjectURL(blob);

    if (mediaType === "image") {
      setImageFiles([file]);
      setImagePreviews([preview]);
    } else {
      setImageFiles(prev => [...prev, file]);
      setImagePreviews(prev => [...prev, preview]);
    }

    // Clean up the original object URL
    URL.revokeObjectURL(cropQueue[cropIndex]);

    const nextIndex = cropIndex + 1;
    if (nextIndex < cropQueue.length) {
      setCropIndex(nextIndex);
    } else {
      setCropperOpen(false);
      setCropQueue([]);
      setCropQueueFiles([]);
      setCropIndex(0);
    }
  };

  const handleCropperClose = (open: boolean) => {
    if (!open) {
      // Clean up remaining URLs
      cropQueue.forEach((url, i) => { if (i >= cropIndex) URL.revokeObjectURL(url); });
      setCropperOpen(false);
      setCropQueue([]);
      setCropQueueFiles([]);
      setCropIndex(0);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
  };

  const selectMediaType = (type: MediaType) => {
    setMediaType(type);
    setImageFiles([]);
    setImagePreviews([]);
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleSubmit = async () => {
    if (!user || !postType || !content.trim()) return;

    setSubmitting(true);
    try {
      let imageUrls: string[] = [];
      let videoUrl: string | null = null;

      if (mediaType === "video" && videoFile) {
        const url = await uploadImage(videoFile);
        if (url) videoUrl = url;
      } else if ((mediaType === "image" || mediaType === "carousel") && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const url = await uploadImage(file);
          if (url) imageUrls.push(url);
        }
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        user_name: user.profile?.name || "User",
        user_avatar: user.profile?.avatar_url || null,
        role: user.profile?.is_provider ? "provider" : "client",
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : null,
        post_type: postType,
        media_type: mediaType || "image",
        video_url: videoUrl,
      });

      if (error) throw error;
      toast({ title: "Post created!", description: "Your post is now live." });
      navigate("/feed");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = postType && content.trim().length > 0 && !submitting && !uploading;

  return (
    <Layout title="Create Post">
      <div className="container-mobile py-4 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        {/* Step 1: Post Type */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">What are you looking for?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPostType("find")}
              className={`p-4 rounded-xl border-2 text-center transition-all space-y-2 ${
                postType === "find" ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
              }`}
            >
              <Search className="w-8 h-8 mx-auto text-primary" />
              <p className="font-semibold text-sm">Find a Service</p>
              <p className="text-xs text-muted-foreground">I need help</p>
            </button>
            <button
              onClick={() => setPostType("provide")}
              className={`p-4 rounded-xl border-2 text-center transition-all space-y-2 ${
                postType === "provide" ? "border-secondary bg-secondary/10" : "border-border hover:border-muted-foreground"
              }`}
            >
              <Wrench className="w-8 h-8 mx-auto text-secondary" />
              <p className="font-semibold text-sm">Provide a Service</p>
              <p className="text-xs text-muted-foreground">I offer help</p>
            </button>
          </div>
        </div>

        {/* Step 2: Media Type */}
        {postType && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-lg font-semibold">Add Media (optional)</h2>
            <div className="flex gap-2">
              <Badge variant={mediaType === "image" ? "default" : "outline"} className="cursor-pointer px-4 py-2" onClick={() => selectMediaType("image")}>
                <ImageIcon className="w-4 h-4 mr-1" /> Image
              </Badge>
              <Badge variant={mediaType === "video" ? "default" : "outline"} className="cursor-pointer px-4 py-2" onClick={() => selectMediaType("video")}>
                <Video className="w-4 h-4 mr-1" /> Video
              </Badge>
              <Badge variant={mediaType === "carousel" ? "default" : "outline"} className="cursor-pointer px-4 py-2" onClick={() => selectMediaType("carousel")}>
                <Images className="w-4 h-4 mr-1" /> Carousel
              </Badge>
            </div>

            {/* Image upload */}
            {mediaType === "image" && (
              <div className="space-y-3">
                {imagePreviews.length === 0 ? (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors">
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Tap to add image (1:1)</p>
                  </button>
                ) : (
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={imagePreviews[0]} className="w-full h-full object-cover" alt="Preview" />
                    <button onClick={() => removeImage(0)} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>
            )}

            {/* Video upload */}
            {mediaType === "video" && (
              <div className="space-y-3">
                {!videoPreview ? (
                  <button onClick={() => videoInputRef.current?.click()} className="w-full aspect-[9/16] max-h-[400px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors">
                    <Video className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Tap to add video (9:16)</p>
                  </button>
                ) : (
                  <div className="relative aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden">
                    <video src={videoPreview} controls className="w-full h-full object-cover" />
                    <button onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              </div>
            )}

            {/* Carousel upload */}
            {mediaType === "carousel" && (
              <div className="space-y-3">
                <div className="flex gap-0 overflow-x-auto snap-x snap-mandatory pb-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative flex-shrink-0 w-full aspect-square snap-center">
                      <img src={preview} className="w-full h-full object-cover" alt={`Preview ${index + 1}`} />
                      <button onClick={() => removeImage(index)} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Images className="w-4 h-4 mr-2" /> Add Images
                </Button>
                {imagePreviews.length > 0 && (
                  <p className="text-xs text-muted-foreground text-center">{imagePreviews.length} image(s) — swipe to preview</p>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Text */}
        {postType && (
          <div className="space-y-2 animate-fade-in">
            <h2 className="text-lg font-semibold">Description</h2>
            <Textarea
              placeholder="Describe the service you're looking for or offering..."
              value={content}
              onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setContent(e.target.value); }}
              className="min-h-[120px] resize-none"
            />
            <p className={`text-xs text-right ${content.length > MAX_CHARS - 50 ? "text-destructive" : "text-muted-foreground"}`}>
              {content.length}/{MAX_CHARS}
            </p>
          </div>
        )}

        {/* Submit */}
        {postType && (
          <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full" size="lg">
            {submitting || uploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
            ) : (
              "Publish Post"
            )}
          </Button>
        )}
      </div>

      {/* Cropper dialog */}
      {cropQueue.length > 0 && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={handleCropperClose}
          imageUrl={cropQueue[cropIndex]}
          onCropComplete={handleCropComplete}
          shape="square"
          label={cropQueue.length > 1 ? `Image ${cropIndex + 1} of ${cropQueue.length}` : "Crop Image"}
        />
      )}
    </Layout>
  );
}
