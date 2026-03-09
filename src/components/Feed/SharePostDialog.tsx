import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Send, 
  Copy, 
  ExternalLink,
  Users,
  MessageCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
}

interface SharePostDialogProps {
  post: {
    id: string;
    user_name: string;
    content: string | null;
    post_type: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SharePostDialog({
  post,
  open,
  onOpenChange,
}: SharePostDialogProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = profiles.filter((profile) =>
        profile.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles.slice(0, 10)); // Show first 10 profiles
    }
  }, [searchQuery, profiles]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, name, avatar_url")
        .neq("user_id", user?.id || "") // Exclude current user
        .limit(50);

      if (error) throw error;
      setProfiles(data || []);
      setFilteredProfiles((data || []).slice(0, 10));
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const toggleProfileSelection = (profile: Profile) => {
    setSelectedProfiles((prev) => {
      const isSelected = prev.some((p) => p.id === profile.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== profile.id);
      } else {
        return [...prev, profile];
      }
    });
  };

  const handleSendMessages = async () => {
    if (selectedProfiles.length === 0) {
      toast.error("Please select at least one person to share with");
      return;
    }

    setIsLoading(true);
    try {
      const shareMessage = `${user?.profile?.name || "Someone"} shared a post with you:\n\n"${post.content?.slice(0, 100)}${post.content && post.content.length > 100 ? "..." : ""}"`;

      const messages = selectedProfiles.map((profile) => ({
        sender_id: user?.id || "",
        receiver_id: profile.user_id,
        content: shareMessage,
      }));

      const { error } = await supabase.from("messages").insert(messages);

      if (error) throw error;

      toast.success(
        `Post shared with ${selectedProfiles.length} ${
          selectedProfiles.length === 1 ? "person" : "people"
        }!`
      );
      
      onOpenChange(false);
      setSelectedProfiles([]);
      setSearchQuery("");
    } catch (error: any) {
      console.error("Error sending messages:", error);
      toast.error("Failed to share post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/feed?post=${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      toast.success("Post link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleExternalShare = async () => {
    try {
      const shareData = {
        title: `${post.user_name}'s ${post.post_type === "find" ? "service request" : "service offer"}`,
        text: post.content || "",
        url: `${window.location.origin}/feed?post=${post.id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy link
        await handleCopyLink();
      }
    } catch (error) {
      // User cancelled or error occurred
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Quick Share Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Share</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="justify-start gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExternalShare}
                className="justify-start gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Share External
              </Button>
            </div>
          </div>

          {/* Share with Users */}
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <h4 className="text-sm font-medium">Send to Users</h4>
            </div>

            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />

            {/* Selected Profiles */}
            {selectedProfiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Selected ({selectedProfiles.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedProfiles.map((profile) => (
                    <Badge
                      key={profile.id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleProfileSelection(profile)}
                    >
                      {profile.name || "User"} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Profiles List */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => {
                  const isSelected = selectedProfiles.some((p) => p.id === profile.id);
                  return (
                    <div
                      key={profile.id}
                      onClick={() => toggleProfileSelection(profile)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-xs">
                          {profile.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {profile.name || "Anonymous User"}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          {selectedProfiles.length > 0 && (
            <Button
              onClick={handleSendMessages}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Sending..." : `Send to ${selectedProfiles.length} ${selectedProfiles.length === 1 ? "person" : "people"}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}