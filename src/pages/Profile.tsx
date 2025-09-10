import { useState } from "react";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
}

interface PortfolioPostProps {
  userName: string;
  description: string;
  media: MediaItem[];
}

export default function PortfolioPost({ userName, description, media }: PortfolioPostProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-6">
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
        <span className="font-semibold">{userName}</span>
      </div>

      {/* Media list (stacked vertically like Behance) */}
      <div className="space-y-4">
        {media.map((item) => (
          <div key={item.id} className="w-full flex justify-center">
            {item.type === "image" ? (
              <img
                src={item.url}
                alt="portfolio"
                className="object-contain"
                style={{ maxHeight: "1000px", maxWidth: "100px" }}
              />
            ) : (
              <video
                src={item.url}
                controls
                className="rounded-lg"
                style={{ maxHeight: "1000px", width: "100%" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-gray-700">{description}</p>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <button
          className="flex items-center text-gray-500 hover:text-red-500"
          onClick={() => setLiked(!liked)}
        >
          {liked ? "❤️" : "🤍"} <span className="ml-1">Like</span>
        </button>
        <button className="text-gray-500 hover:text-blue-500">💬 Comment</button>
        <button className="text-gray-500 hover:text-green-500">📩 Contact</button>
      </div>
    </div>
  );
}