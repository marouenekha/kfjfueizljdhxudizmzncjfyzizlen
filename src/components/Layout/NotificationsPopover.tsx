import { useState, useEffect } from "react";
import { Bell, UserPlus, Star, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: "follow" | "rating" | "message";
  actorName: string;
  actorAvatar: string | null;
  actorId: string;
  message: string;
  createdAt: string;
}

export const NotificationsPopover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Fetch recent follows
      const { data: follows } = await supabase
        .from("follows")
        .select("id, follower_id, created_at")
        .eq("following_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch recent ratings received
      const { data: ratings } = await supabase
        .from("ratings")
        .select("id, rater_id, rating, comment, created_at")
        .eq("rated_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch recent messages received
      const { data: messages } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Gather all actor IDs
      const actorIds = new Set<string>();
      follows?.forEach((f) => actorIds.add(f.follower_id));
      ratings?.forEach((r) => actorIds.add(r.rater_id));
      messages?.forEach((m) => actorIds.add(m.sender_id));

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", Array.from(actorIds));

      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p]) || []
      );

      const allNotifications: Notification[] = [];

      follows?.forEach((f) => {
        const profile = profileMap.get(f.follower_id);
        allNotifications.push({
          id: `follow-${f.id}`,
          type: "follow",
          actorName: profile?.name || "Someone",
          actorAvatar: profile?.avatar_url || null,
          actorId: f.follower_id,
          message: "started following you",
          createdAt: f.created_at,
        });
      });

      ratings?.forEach((r) => {
        const profile = profileMap.get(r.rater_id);
        allNotifications.push({
          id: `rating-${r.id}`,
          type: "rating",
          actorName: profile?.name || "Someone",
          actorAvatar: profile?.avatar_url || null,
          actorId: r.rater_id,
          message: `rated you ${r.rating} star${r.rating !== 1 ? "s" : ""}`,
          createdAt: r.created_at,
        });
      });

      messages?.forEach((m) => {
        const profile = profileMap.get(m.sender_id);
        allNotifications.push({
          id: `msg-${m.id}`,
          type: "message",
          actorName: profile?.name || "Someone",
          actorAvatar: profile?.avatar_url || null,
          actorId: m.sender_id,
          message: m.content.length > 40 ? m.content.slice(0, 40) + "…" : m.content,
          createdAt: m.created_at,
        });
      });

      allNotifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(allNotifications.slice(0, 30));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, user?.id]);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "follow":
        return <UserPlus className="w-4 h-4 text-primary" />;
      case "rating":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "message":
        return <MessageCircle className="w-4 h-4 text-primary" />;
    }
  };

  const handleClick = (notif: Notification) => {
    setOpen(false);
    if (notif.type === "message") {
      navigate(`/messages?user=${notif.actorId}`);
    } else {
      navigate(`/profile?user=${notif.actorId}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
        </div>
        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className="w-full flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                    <AvatarImage src={notif.actorAvatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {notif.actorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{notif.actorName}</span>{" "}
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getIcon(notif.type)}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
