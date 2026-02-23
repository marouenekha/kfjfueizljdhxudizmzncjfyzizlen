import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onRatingSubmitted?: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ 
  open, 
  onOpenChange, 
  userId, 
  userName,
  onRatingSubmitted 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (!user || !rating) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ratings')
        .insert({
          rater_id: user.id,
          rated_id: userId,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Rating submitted!",
        description: `You rated ${userName} ${rating} star${rating !== 1 ? 's' : ''}.`,
      });

      onRatingSubmitted?.();
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (error: any) {
      toast({
        title: "Rating failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === userId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {userName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : "Click to rate"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium">Comment (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              maxLength={300}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !rating}
              className="flex-1"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};