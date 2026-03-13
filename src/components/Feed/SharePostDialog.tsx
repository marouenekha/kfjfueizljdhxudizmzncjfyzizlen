import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ExternalLink, Repeat2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface SharePostDialogProps {
  post: {
    id: string;
    user_id: string | null;
    user_name: string;
    user_avatar: string | null;
    content: string | null;
    post_type: string;
    images: string[] | null;
    media_type: string;
    video_url: string | null;
    role: string | null;
    shared_post_id?: string | null;
    original_user_id?: string | null;
    original_user_name?: string | null;
    original_user_avatar?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostReposted?: () => void;
}

export function SharePostDialog({ post, open, onOpenChange, onPostReposted }: SharePostDialogProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isReposting, setIsReposting] = useState(false);
  const [shareText, setShareText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  const handleRepost = async (withText: boolean) => {
    if (!user?.id) return;
    if (withText && !shareText.trim()) {
      toast.error(t('addTextToShare') || "Add some text");
      return;
    }
    setIsReposting(true);
    try {
      // Always reference the original post, not a repost of a repost
      const originalPostId = post.shared_post_id || post.id;
      const originalUserId = post.shared_post_id ? post.original_user_id : post.user_id;
      const originalUserName = post.shared_post_id ? post.original_user_name : post.user_name;
      const originalUserAvatar = post.shared_post_id ? post.original_user_avatar : post.user_avatar;

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        user_name: user.profile?.name || "User",
        user_avatar: user.profile?.avatar_url || null,
        role: user.profile?.is_provider ? "provider" : "client",
        content: withText ? shareText.trim() : null,
        images: post.images,
        post_type: post.post_type,
        media_type: post.media_type,
        video_url: post.video_url,
        shared_post_id: originalPostId,
        original_user_id: originalUserId,
        original_user_name: originalUserName,
        original_user_avatar: originalUserAvatar,
      } as any);
      if (error) throw error;
      toast.success(t('reposted') || "Shared to your profile!");
      onOpenChange(false);
      setShareText("");
      setShowTextInput(false);
      onPostReposted?.();
    } catch (error: any) {
      console.error("Error reposting:", error);
      toast.error(t('failedToRepost') || "Failed to share");
    } finally {
      setIsReposting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post.id}`);
      toast.success(t('postLinkCopied') || "Link copied!");
    } catch {
      toast.error(t('failedToCopyLink') || "Failed to copy");
    }
  };

  const handleExternalShare = async () => {
    try {
      const shareData = {
        title: `${post.user_name}'s post`,
        text: post.content || "",
        url: `${window.location.origin}/feed?post=${post.id}`,
      };
      if (navigator.share) await navigator.share(shareData);
      else await handleCopyLink();
    } catch { /* cancelled */ }
  };

  const originalName = post.shared_post_id ? post.original_user_name : post.user_name;
  const previewContent = post.content?.slice(0, 80);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setShowTextInput(false); setShareText(""); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{t('sharePost') || "Share Post"}</DialogTitle>
          <DialogDescription className="sr-only">Share this post</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Post preview card */}
          <div className="border border-border rounded-lg p-3 bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground mb-1">{originalName}</p>
            {previewContent && <p className="text-sm line-clamp-2">{previewContent}{post.content && post.content.length > 80 ? "..." : ""}</p>}
            {post.images?.[0] && (
              <img src={post.images[0]} alt="" className="w-full h-24 object-cover rounded mt-2" />
            )}
          </div>

          {/* Text input for "Share with text" */}
          {showTextInput && (
            <Textarea
              placeholder={t('sayAboutThis') || "Say something about this..."}
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              className="resize-none"
              rows={3}
              autoFocus
            />
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            {!showTextInput ? (
              <>
                <Button className="w-full gap-2" onClick={() => handleRepost(false)} disabled={isReposting}>
                  {isReposting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat2 className="w-4 h-4" />}
                  {t('shareNow') || "Share Now"}
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => setShowTextInput(true)}>
                  {t('shareWithText') || "Write something & share"}
                </Button>
              </>
            ) : (
              <Button className="w-full gap-2" onClick={() => handleRepost(true)} disabled={isReposting || !shareText.trim()}>
                {isReposting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat2 className="w-4 h-4" />}
                {t('sharePost') || "Share"}
              </Button>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 gap-1.5 text-muted-foreground" onClick={handleCopyLink}>
                <Copy className="w-4 h-4" /> {t('copyLink') || "Copy Link"}
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 gap-1.5 text-muted-foreground" onClick={handleExternalShare}>
                <ExternalLink className="w-4 h-4" /> {t('shareExternal') || "External"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
