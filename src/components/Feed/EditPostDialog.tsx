import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Wrench, X, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditPostDialogProps {
  post: {
    id: string;
    content: string | null;
    post_type: string;
    images: string[] | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated: () => void;
}

export function EditPostDialog({
  post,
  open,
  onOpenChange,
  onPostUpdated,
}: EditPostDialogProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState(post.content || "");
  const [postType, setPostType] = useState<"find" | "provide">(
    post.post_type as "find" | "provide"
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setContent(post.content || "");
    setPostType(post.post_type as "find" | "provide");
  }, [post]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error(t('pleaseAddContent'));
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({
          content: content.trim(),
          post_type: postType,
        })
        .eq("id", post.id);

      if (error) throw error;

      toast.success(t('postUpdatedSuccess'));
      onPostUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast.error(t('failedToUpdatePost'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('editPost')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Type Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setPostType("find")}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                postType === "find"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              <Search className="w-4 h-4" />
              {t('findService')}
            </button>
            <button
              onClick={() => setPostType("provide")}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                postType === "provide"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              <Wrench className="w-4 h-4" />
              {t('provideService')}
            </button>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('contentLabel')}</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('describeServiceRequest')}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/500
            </p>
          </div>

          {/* Show existing images (read-only for now) */}
          {post.images && post.images.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {t('currentImages')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((url, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={url}
                      alt={`${t('image')} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('imageEditingSoon')}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
