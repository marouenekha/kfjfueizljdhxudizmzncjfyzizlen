import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageCropper } from "@/components/ui/image-cropper";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Search, Wrench, ImageIcon, Video, Images, X, Loader2,
  ImagePlus, Tag
} from "lucide-react";

type PostType = "find" | "provide";
type MediaType = "image" | "video" | "carousel";
type CreationPage = "post" | "portfolio" | "store";

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { uploadImage, uploading } = useImageUpload("posts");
  const { uploadImage: uploadPortfolioImage, uploading: portfolioUploading } = useImageUpload("portfolio");

  const profileRole = (user?.profile as any)?.profile_role || "provider";

  // Determine available pages based on role
  const getAvailablePages = (): CreationPage[] => {
    if (profileRole === "both") return ["post", "portfolio", "store"];
    // Seller and Provider both get Post + Portfolio per user request
    return ["post", "portfolio"];
  };

  const availablePages = getAvailablePages();
  const [activePage, setActivePage] = useState<CreationPage>("post");
  const activeIndex = availablePages.indexOf(activePage);

  // Swipe handling
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    // Don't capture swipe if starting on an interactive element (input, textarea, button, scrollable)
    const target = e.target as HTMLElement;
    if (target.closest('video, [data-no-swipe], .overflow-x-auto, .snap-x')) return;
    // Allow swipe on inputs/textareas only if they are not focused
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && target.closest('input, textarea')) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    touchStartY.current = e.targetTouches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || touchStartY.current === null) return;
    const distanceX = touchStart - touchEnd;
    // Only trigger page change for clearly horizontal swipes
    if (Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0 && activeIndex < availablePages.length - 1) {
        setActivePage(availablePages[activeIndex + 1]);
      } else if (distanceX < 0 && activeIndex > 0) {
        setActivePage(availablePages[activeIndex - 1]);
      }
    }
    touchStartY.current = null;
  };

  // ===== POST STATE =====
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [postType, setPostType] = useState<PostType | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [cropIndex, setCropIndex] = useState(0);
  const [cropperOpen, setCropperOpen] = useState(false);
  const MAX_CHARS = 500;

  // ===== PORTFOLIO STATE =====
  const portfolioFileRef = useRef<HTMLInputElement>(null);
  const portfolioVideoRef = useRef<HTMLInputElement>(null);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDesc, setPortfolioDesc] = useState("");
  const [portfolioTags, setPortfolioTags] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [portfolioImagePreviews, setPortfolioImagePreviews] = useState<string[]>([]);
  const [portfolioVideoFile, setPortfolioVideoFile] = useState<File | null>(null);
  const [portfolioVideoPreview, setPortfolioVideoPreview] = useState<string | null>(null);
  const [portfolioSubmitting, setPortfolioSubmitting] = useState(false);

  // ===== STORE STATE =====
  const storeFileRef = useRef<HTMLInputElement>(null);
  const [storeTitle, setStoreTitle] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storePrice, setStorePrice] = useState("");
  const [storeImages, setStoreImages] = useState<File[]>([]);
  const [storeImagePreviews, setStoreImagePreviews] = useState<string[]>([]);
  const [storeSubmitting, setStoreSubmitting] = useState(false);

  // ===== POST HANDLERS =====
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const selectedFiles = mediaType === "image" ? [files[0]] : files;
    const urls = selectedFiles.map(f => URL.createObjectURL(f));
    setCropQueue(urls);
    setCropIndex(0);
    setCropperOpen(true);
    e.target.value = "";
  };

  const handleCropComplete = (blob: Blob) => {
    const file = new File([blob], `cropped-${Date.now()}-${cropIndex}.jpg`, { type: "image/jpeg" });
    const preview = URL.createObjectURL(blob);
    if (mediaType === "image") {
      setImageFiles([file]); setImagePreviews([preview]);
    } else {
      setImageFiles(prev => [...prev, file]); setImagePreviews(prev => [...prev, preview]);
    }
    URL.revokeObjectURL(cropQueue[cropIndex]);
    const nextIndex = cropIndex + 1;
    if (nextIndex < cropQueue.length) { setCropIndex(nextIndex); }
    else { setCropperOpen(false); setCropQueue([]); setCropIndex(0); }
  };

  const handleCropperClose = (open: boolean) => {
    if (!open) {
      cropQueue.forEach((url, i) => { if (i >= cropIndex) URL.revokeObjectURL(url); });
      setCropperOpen(false); setCropQueue([]); setCropIndex(0);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file); setVideoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null); setVideoPreview(null);
  };

  const selectMediaType = (type: MediaType) => {
    setMediaType(type); setImageFiles([]); setImagePreviews([]);
    setVideoFile(null); setVideoPreview(null);
  };

  const handleSubmitPost = async () => {
    if (!user || !postType || !content.trim()) return;
    setSubmitting(true);
    try {
      let imageUrls: string[] = [];
      let videoUrl: string | null = null;
      if (mediaType === "video" && videoFile) {
        const url = await uploadImage(videoFile); if (url) videoUrl = url;
      } else if ((mediaType === "image" || mediaType === "carousel") && imageFiles.length > 0) {
        for (const file of imageFiles) { const url = await uploadImage(file); if (url) imageUrls.push(url); }
      }
      const { error } = await supabase.from("posts").insert({
        user_id: user.id, user_name: user.profile?.name || "User",
        user_avatar: user.profile?.avatar_url || null,
        role: user.profile?.is_provider ? "provider" : "client",
        content: content.trim(), images: imageUrls.length > 0 ? imageUrls : null,
        post_type: postType, media_type: mediaType || "image", video_url: videoUrl,
      });
      if (error) throw error;
      toast({ title: t('postCreated'), description: t('postCreatedDesc') });
      navigate("/feed");
    } catch (error: any) {
      toast({ title: t('error'), description: error.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  // ===== PORTFOLIO HANDLERS =====
  const handlePortfolioImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      setPortfolioImages(prev => [...prev, f]);
      setPortfolioImagePreviews(prev => [...prev, URL.createObjectURL(f)]);
    });
    e.target.value = "";
  };

  const handlePortfolioVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPortfolioVideoFile(file); setPortfolioVideoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removePortfolioImage = (index: number) => {
    URL.revokeObjectURL(portfolioImagePreviews[index]);
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
    setPortfolioImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removePortfolioVideo = () => {
    if (portfolioVideoPreview) URL.revokeObjectURL(portfolioVideoPreview);
    setPortfolioVideoFile(null); setPortfolioVideoPreview(null);
  };

  const handleSubmitPortfolio = async () => {
    if (!user || !portfolioTitle.trim()) return;
    setPortfolioSubmitting(true);
    try {
      let imageUrls: string[] = [];
      let videoUrl: string | null = null;
      for (const file of portfolioImages) {
        const url = await uploadPortfolioImage(file); if (url) imageUrls.push(url);
      }
      if (portfolioVideoFile) {
        const url = await uploadPortfolioImage(portfolioVideoFile); if (url) videoUrl = url;
      }
      const tags = portfolioTags.split(",").map(t => t.trim()).filter(Boolean);
      const { error } = await supabase.from("portfolio_items").insert({
        user_id: user.id, title: portfolioTitle.trim(),
        description: portfolioDesc.trim() || null,
        images: imageUrls, video_url: videoUrl,
        tags: tags.length > 0 ? tags : null,
      });
      if (error) throw error;
      toast({ title: t('portfolioItemCreated'), description: t('portfolioItemCreatedDesc') });
      navigate("/profile");
    } catch (error: any) {
      toast({ title: t('error'), description: error.message, variant: "destructive" });
    } finally { setPortfolioSubmitting(false); }
  };

  // ===== STORE HANDLERS =====
  const handleStoreImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      setStoreImages(prev => [...prev, f]);
      setStoreImagePreviews(prev => [...prev, URL.createObjectURL(f)]);
    });
    e.target.value = "";
  };

  const removeStoreImage = (index: number) => {
    URL.revokeObjectURL(storeImagePreviews[index]);
    setStoreImages(prev => prev.filter((_, i) => i !== index));
    setStoreImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitStore = async () => {
    if (!user || !storeTitle.trim() || !storePrice) return;
    setStoreSubmitting(true);
    try {
      let imageUrls: string[] = [];
      for (const file of storeImages) {
        const url = await uploadImage(file); if (url) imageUrls.push(url);
      }
      const { error } = await supabase.from("products").insert({
        user_id: user.id, title: storeTitle.trim(),
        description: storeDesc.trim() || null,
        price: parseFloat(storePrice), images: imageUrls,
      });
      if (error) throw error;
      toast({ title: t('productAdded') });
      navigate("/profile");
    } catch (error: any) {
      toast({ title: t('error'), description: error.message, variant: "destructive" });
    } finally { setStoreSubmitting(false); }
  };

  const pageLabels: Record<CreationPage, string> = {
    post: t('post'),
    portfolio: t('portfolio'),
    store: t('storeProduct'),
  };

  const canSubmitPost = postType && content.trim().length > 0 && !submitting && !uploading;
  const canSubmitPortfolio = portfolioTitle.trim().length > 0 && !portfolioSubmitting && !portfolioUploading;
  const canSubmitStore = storeTitle.trim().length > 0 && !!storePrice && !storeSubmitting && !uploading;

  return (
    <Layout title={t('create')}>
      <div className="w-full max-w-2xl mx-auto px-4 py-4">

        {/* Tab indicators */}
        <div className="relative border-b border-border mb-4">
          <div className="flex">
            {availablePages.map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors relative text-center",
                  activePage === page ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {pageLabels[page]}
                {activePage === page && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Swipeable content */}
        <div
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="min-h-[60vh]"
        >
          {/* PAGE 1: POST */}
          {activePage === "post" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">{t('whatLookingFor')}</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPostType("find")}
                    className={cn("p-4 rounded-xl border-2 text-center transition-all space-y-2",
                      postType === "find" ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground")}>
                    <Search className="w-8 h-8 mx-auto text-primary" />
                    <p className="font-semibold text-sm">{t('findAService')}</p>
                    <p className="text-xs text-muted-foreground">{t('iNeedHelp')}</p>
                  </button>
                  <button onClick={() => setPostType("provide")}
                    className={cn("p-4 rounded-xl border-2 text-center transition-all space-y-2",
                      postType === "provide" ? "border-secondary bg-secondary/10" : "border-border hover:border-muted-foreground")}>
                    <Wrench className="w-8 h-8 mx-auto text-secondary" />
                    <p className="font-semibold text-sm">{t('provideAService')}</p>
                    <p className="text-xs text-muted-foreground">{t('iOfferHelp')}</p>
                  </button>
                </div>
              </div>

              {postType && (
                <>
                  <div className="space-y-3 animate-fade-in">
                    <h2 className="text-lg font-semibold">{t('addMedia')}</h2>
                    <div className="flex gap-2">
                      <Badge variant={mediaType === "image" ? "default" : "outline"} className="cursor-pointer px-4 py-2" onClick={() => selectMediaType("image")}>
                        <ImageIcon className="w-4 h-4 mr-1" /> {t('image')}
                      </Badge>
                      <Badge variant={mediaType === "video" ? "default" : "outline"} className="cursor-pointer px-4 py-2" onClick={() => selectMediaType("video")}>
                        <Video className="w-4 h-4 mr-1" /> {t('video')}
                      </Badge>
                      <Badge variant={mediaType === "carousel" ? "default" : "outline"} className="cursor-pointer px-4 py-2" onClick={() => selectMediaType("carousel")}>
                        <Images className="w-4 h-4 mr-1" /> {t('carousel')}
                      </Badge>
                    </div>

                    {mediaType === "image" && (
                      <div className="space-y-3">
                        {imagePreviews.length === 0 ? (
                          <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors">
                            <ImageIcon className="w-10 h-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">{t('tapToAddImage')}</p>
                          </button>
                        ) : (
                          <div className="relative aspect-square rounded-xl overflow-hidden">
                            <img src={imagePreviews[0]} className="w-full h-full object-cover" alt="Preview" />
                            <button onClick={() => removeImage(0)} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                      </div>
                    )}

                    {mediaType === "video" && (
                      <div className="space-y-3">
                        {!videoPreview ? (
                          <button onClick={() => videoInputRef.current?.click()} className="w-full aspect-[9/16] max-h-[400px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors">
                            <Video className="w-10 h-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">{t('tapToAddVideo')}</p>
                          </button>
                        ) : (
                          <div className="relative aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden">
                            <video src={videoPreview} controls className="w-full h-full object-cover" />
                            <button onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
                      </div>
                    )}

                    {mediaType === "carousel" && (
                      <div className="space-y-3">
                        <div className="flex gap-0 overflow-x-auto snap-x snap-mandatory pb-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative flex-shrink-0 w-full aspect-square snap-center">
                              <img src={preview} className="w-full h-full object-cover" alt={`Preview ${index + 1}`} />
                              <button onClick={() => removeImage(index)} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                          <Images className="w-4 h-4 mr-2" /> {t('addImages')}
                        </Button>
                        {imagePreviews.length > 0 && <p className="text-xs text-muted-foreground text-center">{imagePreviews.length} {t('imageCount')}</p>}
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 animate-fade-in">
                    <h2 className="text-lg font-semibold">{t('description')}</h2>
                    <Textarea placeholder={t('describeService')} value={content}
                      onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setContent(e.target.value); }}
                      className="min-h-[120px] resize-none" />
                    <p className={cn("text-xs text-right", content.length > MAX_CHARS - 50 ? "text-destructive" : "text-muted-foreground")}>
                      {content.length}/{MAX_CHARS}
                    </p>
                  </div>

                  <Button onClick={handleSubmitPost} disabled={!canSubmitPost} className="w-full" size="lg">
                    {submitting || uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('publishing')}</> : t('publishPost')}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* PAGE 2: PORTFOLIO */}
          {activePage === "portfolio" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold">{t('createPortfolioItem')}</h2>

              {/* Images */}
              <div>
                <Label>{t('projectImages')}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {portfolioImagePreviews.map((url, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removePortfolioImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => portfolioFileRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors gap-1">
                    {portfolioUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ImagePlus className="w-5 h-5" /><span className="text-[10px]">{t('addImages')}</span></>}
                  </button>
                </div>
                <input ref={portfolioFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioImageSelect} />
              </div>

              {/* Video (optional) */}
              <div>
                <Label>{t('projectVideo')}</Label>
                {!portfolioVideoPreview ? (
                  <button onClick={() => portfolioVideoRef.current?.click()}
                    className="w-full h-32 mt-2 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors text-muted-foreground">
                    <Video className="w-6 h-6" /><span className="text-xs">{t('addVideoOptional')}</span>
                  </button>
                ) : (
                  <div className="relative mt-2 rounded-xl overflow-hidden h-48">
                    <video src={portfolioVideoPreview} controls className="w-full h-full object-cover" />
                    <button onClick={removePortfolioVideo} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                  </div>
                )}
                <input ref={portfolioVideoRef} type="file" accept="video/*" className="hidden" onChange={handlePortfolioVideoSelect} />
              </div>

              <div>
                <Label>{t('projectTitleLabel')}</Label>
                <Input value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} placeholder={t('projectTitlePlaceholder')} className="mt-1" />
              </div>

              <div>
                <Label>{t('description')}</Label>
                <Textarea value={portfolioDesc} onChange={(e) => setPortfolioDesc(e.target.value)} placeholder={t('portfolioDescPlaceholder')} rows={3} className="mt-1" />
              </div>

              <div>
                <Label className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {t('tagsOptional')}</Label>
                <Input value={portfolioTags} onChange={(e) => setPortfolioTags(e.target.value)} placeholder={t('tagsPlaceholder')} className="mt-1" />
              </div>

              <Button onClick={handleSubmitPortfolio} disabled={!canSubmitPortfolio} className="w-full" size="lg">
                {portfolioSubmitting || portfolioUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('publishing')}</> : t('publishPortfolio')}
              </Button>
            </div>
          )}

          {/* PAGE 3: STORE PRODUCT */}
          {activePage === "store" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold">{t('createStoreProduct')}</h2>

              {/* Product Images - same carousel style as posts */}
              <div>
                <Label>{t('productImages')}</Label>
                <div className="space-y-3 mt-2">
                  {storeImagePreviews.length === 0 ? (
                    <button onClick={() => storeFileRef.current?.click()} className="w-full aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors">
                      <ImagePlus className="w-10 h-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">{t('tapToAddImage')}</p>
                    </button>
                  ) : storeImagePreviews.length === 1 ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={storeImagePreviews[0]} className="w-full h-full object-cover" alt="Preview" />
                      <button onClick={() => removeStoreImage(0)} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex gap-0 overflow-x-auto snap-x snap-mandatory pb-2" data-no-swipe>
                      {storeImagePreviews.map((preview, index) => (
                        <div key={index} className="relative flex-shrink-0 w-full aspect-square snap-center">
                          <img src={preview} className="w-full h-full object-cover" alt={`Preview ${index + 1}`} />
                          <button onClick={() => removeStoreImage(index)} className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" onClick={() => storeFileRef.current?.click()} className="w-full">
                    <Images className="w-4 h-4 mr-2" /> {t('addImages')}
                  </Button>
                  {storeImagePreviews.length > 1 && <p className="text-xs text-muted-foreground text-center">{storeImagePreviews.length} {t('imageCount')}</p>}
                </div>
                <input ref={storeFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleStoreImageSelect} />
              </div>

              <div>
                <Label>{t('productTitle')}</Label>
                <Input value={storeTitle} onChange={(e) => setStoreTitle(e.target.value)} placeholder={t('productTitlePlaceholder')} className="mt-1" />
              </div>

              <div>
                <Label>{t('productPrice')}</Label>
                <Input type="number" min="0" step="0.01" value={storePrice} onChange={(e) => setStorePrice(e.target.value)} placeholder="0.00" className="mt-1" />
              </div>

              <div>
                <Label>{t('productDescription')}</Label>
                <Textarea value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} placeholder={t('productDescriptionPlaceholder')} rows={3} className="mt-1" />
              </div>

              <Button onClick={handleSubmitStore} disabled={!canSubmitStore} className="w-full" size="lg">
                {storeSubmitting || uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('publishing')}</> : t('addProduct')}
              </Button>
            </div>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 py-4">
          {availablePages.map((page, i) => (
            <div key={page} className={cn("w-2 h-2 rounded-full transition-all",
              i === activeIndex ? "bg-primary w-4" : "bg-muted-foreground/30")} />
          ))}
        </div>
      </div>

      {cropQueue.length > 0 && (
        <ImageCropper open={cropperOpen} onOpenChange={handleCropperClose}
          imageUrl={cropQueue[cropIndex]} onCropComplete={handleCropComplete} shape="square"
          label={cropQueue.length > 1 ? t('imageOf', { current: cropIndex + 1, total: cropQueue.length }) : t('cropImage')} />
      )}
    </Layout>
  );
}
