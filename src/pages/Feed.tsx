import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePostSubmit = async () => {
    if (!content && !image) return;

    setLoading(true);

    try {
      // 1️⃣ Upload image if exists
      let imageUrl = null;
      if (image) {
        const { data, error } = await supabase.storage
          .from("post-images")
          .upload(`public/${Date.now()}-${image.name}`, image);

        if (error) throw error;
        imageUrl = data.path;
      }

      // 2️⃣ Insert post
      const { error } = await supabase.from("posts").insert([
        {
          user_id: user?.id,
          content,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      navigate("/feed"); // redirect to feed after post
    } catch (err: any) {
      console.error("Error creating post:", err);
      alert(err.message || "Erreur lors de la création du post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Post" showMenu={true}>
      <div className="container mx-auto max-w-2xl p-4 space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.avatar_url || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <span className="font-semibold">{user?.name || "Utilisateur"}</span>
          </div>

          {/* Textarea */}
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Quoi de neuf ?"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Image Upload */}
          <div className="flex items-center mt-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-blue-500">
              <ImageIcon className="w-5 h-5" />
              Ajouter une photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>
            {image && <span className="text-gray-500">{image.name}</span>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handlePostSubmit}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? "Publication..." : "Publier"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}