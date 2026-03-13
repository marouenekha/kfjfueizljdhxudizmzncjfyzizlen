import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Copy, ExternalLink, Users, MessageCircle, Repeat2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
}

interface SharePostDialogProps {
  post: { id: string; user_id: string | null; user_name: string; user_avatar: string | null; content: string | null; post_type: string; images: string[] | null; media_type: string; video_url: string | null; role: string | null; };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostReposted?: () => void;
}

export function SharePostDialog({ post, open, onOpenChange, onPostReposted }: SharePostDialogProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReposting, setIsReposting] = useState(false);

  useEffect(() => { if (open) fetchProfiles(); }, [open]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredProfiles(profiles.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setFilteredProfiles(profiles.slice(0, 10));
    }
  }, [searchQuery, profiles]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("id, user_id, name, avatar_url").neq("user_id", user?.id || "").limit(50);
      if (error) throw error;
      setProfiles(data || []);
      setFilteredProfiles((data || []).slice(0, 10));
    } catch (error) { console.error("Error fetching profiles:", error); }
  };

  const toggleProfileSelection = (profile: Profile) => {
    setSelectedProfiles((prev) => prev.some((p) => p.id === profile.id) ? prev.filter((p) => p.id !== profile.id) : [...prev, profile]);
  };

  const handleSendMessages = async () => {
    if (selectedProfiles.length === 0) { toast.error(t('selectAtLeastOne')); return; }
    setIsLoading(true);
    try {
      const shareMessage = `${user?.profile?.name || "Someone"} shared a post with you:\n\n"${post.content?.slice(0, 100)}${post.content && post.content.length > 100 ? "..." : ""}"`;
      const messages = selectedProfiles.map((profile) => ({ sender_id: user?.id || "", receiver_id: profile.user_id, content: shareMessage }));
      const { error } = await supabase.from("messages").insert(messages);
      if (error) throw error;
      const peopleWord = selectedProfiles.length === 1 ? t('person') : t('people');
      toast.success(t('postShared', { count: selectedProfiles.length, people: peopleWord }));
      onOpenChange(false); setSelectedProfiles([]); setSearchQuery("");
    } catch (error: any) {
      console.error("Error sending messages:", error);
      toast.error(t('failedToSharePost'));
    } finally { setIsLoading(false); }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post.id}`);
      toast.success(t('postLinkCopied'));
    } catch { toast.error(t('failedToCopyLink')); }
  };

  const handleExternalShare = async () => {
    try {
      const shareData = {
        title: `${post.user_name}'s ${post.post_type === "find" ? t('serviceRequest') : t('serviceOffer')}`,
        text: post.content || "",
        url: `${window.location.origin}/feed?post=${post.id}`,
      };
      if (navigator.share) { await navigator.share(shareData); }
      else { await handleCopyLink(); }
    } catch { /* User cancelled */ }
  };

  const handleRepost = async () => {
    if (!user?.id) return;
    setIsReposting(true);
    try {
      const originalPostId = (post as any).shared_post_id || post.id;
      const originalUserId = (post as any).original_user_id || post.user_id;
      const originalUserName = (post as any).original_user_name || post.user_name;
      const originalUserAvatar = (post as any).original_user_avatar || post.user_avatar;

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        user_name: user.profile?.name || "User",
        user_avatar: user.profile?.avatar_url || null,
        role: user.profile?.is_provider ? "provider" : "client",
        content: post.content,
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
      toast.success(t('reposted'));
      onOpenChange(false);
      onPostReposted?.();
    } catch (error: any) {
      console.error("Error reposting:", error);
      toast.error(t('failedToRepost'));
    } finally { setIsReposting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5" /> {t('sharePost')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Repost button */}
          {user?.id !== post.user_id && (
            <Button variant="outline" onClick={handleRepost} disabled={isReposting} className="w-full justify-start gap-2">
              <Repeat2 className="w-4 h-4" />
              {isReposting ? t('publishing') : t('repostToProfile')}
            </Button>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('quickShare')}</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="justify-start gap-2">
                <Copy className="w-4 h-4" /> {t('copyLink')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExternalShare} className="justify-start gap-2">
                <ExternalLink className="w-4 h-4" /> {t('shareExternal')}
              </Button>
            </div>
          </div>

          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <h4 className="text-sm font-medium">{t('sendToUsers')}</h4>
            </div>
            <Input placeholder={t('searchUsers')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9" />

            {selectedProfiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{t('selected')} ({selectedProfiles.length})</p>
                <div className="flex flex-wrap gap-1">
                  {selectedProfiles.map((profile) => (
                    <Badge key={profile.id} variant="secondary" className="cursor-pointer" onClick={() => toggleProfileSelection(profile)}>
                      {profile.name || "User"} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => {
                  const isSelected = selectedProfiles.some((p) => p.id === profile.id);
                  return (
                    <div key={profile.id} onClick={() => toggleProfileSelection(profile)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/60"}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-xs">{profile.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{profile.name || "Anonymous User"}</p></div>
                      {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('noUsersFound')}</p>
                </div>
              )}
            </div>
          </div>

          {selectedProfiles.length > 0 && (
            <Button onClick={handleSendMessages} disabled={isLoading} className="w-full">
              {isLoading ? t('sending') : t('sendTo', { count: selectedProfiles.length, people: selectedProfiles.length === 1 ? t('person') : t('people') })}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
