import { useState, useRef, useEffect } from "react";
import { Camera, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageCropper } from "@/components/ui/image-cropper";
import { LocationSelector } from "@/components/ui/location-selector";
import { useTranslation } from "react-i18next";

interface ProfileEditDialogProps { open: boolean; onOpenChange: (open: boolean) => void; }

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { uploadImage, uploading } = useImageUpload('avatars');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(""); const [bio, setBio] = useState(""); const [location, setLocation] = useState("");
  const [phone, setPhone] = useState(""); const [avatarUrl, setAvatarUrl] = useState(""); const [isProvider, setIsProvider] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]); const [loading, setLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false); const [cropImageUrl, setCropImageUrl] = useState('');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [profileRole, setProfileRole] = useState<string>("provider");
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; latitude: number; longitude: number; } | null>(null);

  const serviceKeys = ["cleaning", "plumbing", "electrical", "painting", "carpentry", "gardening", "moving", "tutoring", "petCare", "photography"];

  useEffect(() => {
    if (open && user?.profile) {
      const p = user.profile;
      setName(p.name || ""); setBio(p.bio || ""); setLocation(p.location || "");
      setAvatarUrl(p.avatar_url || ""); setPhone(p.phone || "");
      setIsProvider(p.is_provider || false); setServiceTypes(p.service_types || []);
      setProfileRole((p as any).profile_role || "provider");
      if ((p as any).latitude && (p as any).longitude) {
        setSelectedLocation({ address: p.location || '', latitude: (p as any).latitude, longitude: (p as any).longitude });
      }
    }
  }, [open, user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setCropImageUrl(URL.createObjectURL(file)); setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const url = await uploadImage(new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' }));
    if (url) setAvatarUrl(url);
    URL.revokeObjectURL(cropImageUrl);
  };

  const toggleServiceType = (service: string) => {
    setServiceTypes(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        user_id: user.id, name, bio, location: selectedLocation?.address || location,
        avatar_url: avatarUrl, phone, is_provider: isProvider || profileRole === 'provider' || profileRole === 'both',
        service_types: serviceTypes.length > 0 ? serviceTypes : null,
        latitude: selectedLocation?.latitude || null, longitude: selectedLocation?.longitude || null,
        profile_role: profileRole,
      } as any, { onConflict: 'user_id' });
      if (error) throw error;
      if (avatarUrl || name) await supabase.from('posts').update({ user_avatar: avatarUrl, user_name: name }).eq('user_id', user.id);
      window.location.reload();
      toast({ title: t('profileUpdated'), description: t('profileUpdatedDesc') });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: t('updateFailed'), description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('editProfileTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <Avatar className="w-20 h-20"><AvatarImage src={avatarUrl} alt={name} /><AvatarFallback className="text-lg">{name?.[0] || 'U'}</AvatarFallback></Avatar>
                <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Camera className="w-4 h-4" />}
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <p className="text-xs text-muted-foreground text-center">{t('uploadCropPicture')}</p>
            </div>
            <div className="space-y-3">
              <div><Label htmlFor="name">{t('name')}</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('enterYourName')} /></div>
              <div><Label htmlFor="bio">{t('bio')}</Label><Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('tellAboutYourself')} maxLength={200} /></div>
              <div><Label htmlFor="location">{t('location')}</Label>
                <div className="flex gap-2">
                  <Input id="location" value={selectedLocation?.address || location} onChange={(e) => setLocation(e.target.value)} placeholder={t('enterYourLocation')} className="flex-1" />
                  <Button type="button" variant="outline" onClick={() => setShowLocationSelector(true)}><MapPin className="w-4 h-4" /></Button>
                </div>
              </div>
              <div><Label htmlFor="phone">{t('phone')}</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('yourPhoneNumber')} /></div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="provider" checked={isProvider} onCheckedChange={(checked) => setIsProvider(checked === true)} />
                  <Label htmlFor="provider" className="text-sm">{t('imServiceProvider')}</Label>
                </div>
                {isProvider && (
                  <div><Label>{t('serviceTypes')}</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {serviceKeys.map((key) => (
                        <Badge key={key} variant={serviceTypes.includes(t(key)) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleServiceType(t(key))}>{t(key)}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">{t('cancel')}</Button>
              <Button onClick={handleSave} disabled={loading} className="flex-1">{loading ? t('saving') : t('saveChanges')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ImageCropper open={showCropper} onOpenChange={setShowCropper} imageUrl={cropImageUrl} onCropComplete={handleCropComplete} />
      <LocationSelector open={showLocationSelector} onOpenChange={setShowLocationSelector}
        onLocationSelect={(loc) => { setSelectedLocation(loc); setLocation(loc.address); }} initialLocation={location} />
    </>
  );
};
