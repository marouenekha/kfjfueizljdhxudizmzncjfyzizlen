import { useState, useEffect, useRef } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[];
}

interface AddEditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSaved: () => void;
}

export const AddEditProductDialog = ({
  open,
  onOpenChange,
  product,
  onSaved,
}: AddEditProductDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadMultipleImages, uploading } = useImageUpload("posts");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setImages(product.images || []);
    } else {
      setTitle("");
      setDescription("");
      setPrice("");
      setImages([]);
    }
  }, [product, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const urls = await uploadMultipleImages(Array.from(files));
    setImages((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user || !title.trim() || !price) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      images,
    };

    let error;
    if (isEditing && product) {
      ({ error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", product.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEditing ? t("productUpdated") : t("productAdded") });
      onSaved();
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editProduct") : t("addProduct")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t("productTitle")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("productTitlePlaceholder")}
            />
          </div>

          <div>
            <Label>{t("productDescription")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("productDescriptionPlaceholder")}
              rows={3}
            />
          </div>

          <div>
            <Label>{t("productPrice")}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Images */}
          <div>
            <Label>{t("productImages")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ImagePlus className="w-5 h-5" />
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || !price}
            className="w-full"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? t("saveChanges") : t("addProduct")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
