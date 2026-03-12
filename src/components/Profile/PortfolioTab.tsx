import { useState, useEffect } from "react";
import { FileText, Loader2, Trash2, Edit, X, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  video_url: string | null;
  tags: string[] | null;
  category: string | null;
  created_at: string;
}

interface PortfolioTabProps {
  userId: string;
  isOwnProfile: boolean;
}

export const PortfolioTab = ({ userId, isOwnProfile }: PortfolioTabProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    fetchItems();
  }, [userId]);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setItems((data as PortfolioItem[]) || []);
    setLoading(false);
  };

  const handleDelete = async (itemId: string) => {
    const { error } = await supabase.from("portfolio_items").delete().eq("id", itemId);
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setSelectedItem(null);
      toast({ title: t("portfolioItemDeleted") });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{t("noPortfolioItems")}</h3>
      </div>
    );
  }

  return (
    <>
      {/* 3-column grid */}
      <div className="grid grid-cols-3 gap-1">
        {items.map((item) => {
          const thumbnail = item.images?.[0] || item.video_url;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="aspect-square overflow-hidden bg-muted relative group"
            >
              {thumbnail ? (
                item.video_url && !item.images?.length ? (
                  <video src={item.video_url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={thumbnail} alt={item.title} className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                <p className="text-white text-xs p-1.5 opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                  {item.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className={isRTL ? "text-right" : "text-left"}>
                  {selectedItem.title}
                </DialogTitle>
              </DialogHeader>

              {/* Images */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="space-y-2">
                  {selectedItem.images.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full rounded-lg" />
                  ))}
                </div>
              )}

              {/* Video */}
              {selectedItem.video_url && (
                <video src={selectedItem.video_url} controls className="w-full rounded-lg" />
              )}

              {/* Description */}
              {selectedItem.description && (
                <p className={`text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
                  {selectedItem.description}
                </p>
              )}

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Owner actions */}
              {isOwnProfile && (
                <div className="flex justify-end pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedItem.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> {t("delete")}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
