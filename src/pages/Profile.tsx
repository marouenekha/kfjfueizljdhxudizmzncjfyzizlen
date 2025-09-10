// components/PortfolioManager.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon, Video } from "lucide-react";

interface PortfolioPostProps {
  id: string;
  userName: string;
  description: string;
  media: { type: "image" | "video"; url: string }[];
}

function PortfolioPost({ userName, description, media }: PortfolioPostProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <div className="font-semibold">{userName}</div>
      </div>

      {/* Media (stacked like Behance) */}
      <div className="space-y-2">
        {media.length > 0 ? (
          media.map((m, i) =>
            m.type === "image" ? (
              <img
                key={i}
                src={m.url}
                alt={`portfolio-${i}`}
                className="w-full max-h-[700px] object-contain"
              />
            ) : (
              <video
                key={i}
                src={m.url}
                controls
                className="w-full max-h-[700px] bg-black"
              />
            )
          )
        ) : (
          <div className="text-center text-gray-400 py-6">
            No media uploaded yet
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className="px-4 py-3 text-sm text-gray-700">{description}</div>
      )}
    </div>
  );
}

export function PortfolioManager({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  const [portfolioPosts, setPortfolioPosts] = useState<PortfolioPostProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, [userId]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Normalize media data
      const posts = (data || []).map((p) => ({
        id: p.id,
        userName: p.user_name || "User",
        description: p.description || "",
        media: p.media || [], // [{type:"image", url:"..."}, {type:"video", url:"..."}]
      }));

      setPortfolioPosts(posts);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Add Button (only if it's the owner's profile) */}
      {isOwnProfile && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => alert("Open upload modal")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Portfolio
          </Button>
        </div>
      )}

      {/* Portfolio Posts */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : portfolioPosts.length > 0 ? (
        portfolioPosts.map((post) => (
          <PortfolioPost
            key={post.id}
            id={post.id}
            userName={post.userName}
            description={post.description}
            media={post.media}
          />
        ))
      ) : (
        <p className="text-center text-gray-400">
          {isOwnProfile
            ? "You haven’t added anything to your portfolio yet."
            : "This user hasn’t shared any portfolio items yet."}
        </p>
      )}
    </div>
  );
}