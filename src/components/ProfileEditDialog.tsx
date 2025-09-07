import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, MapPin } from "lucide-react";
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

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload('avatars');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isProvider, setIsProvider] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const availableServices = [
    "Cleaning", "Plumbing", "Electrical", "Painting", "Carpentry", 
    "Gardening", "Moving", "Tutoring", "Pet Care", "Photography"
  ];

  useEffect(() => {
    if (open && user?.profile) {
      const profile = user.profile;
      setName(profile.name || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setAvatarUrl(profile.avatar_url || "");
      setPhone(profile.phone || "");
      setIsProvider(profile.is_provider || false);
      setServiceTypes(profile.service_types || []);
      if ((profile as any).latitude && (profile as any).longitude) {
        setSelectedLocation({
          address: profile.location || '',
          latitude: (profile as any).latitude,
          longitude: (profile as any).longitude,
        });
      }
    }
  }, [open, user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL for cropping
    const previewUrl = URL.createObjectURL(file);
    setCropImageUrl(previewUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    const url = await uploadImage(croppedFile);
    if (url) {
      setAvatarUrl(url);
    }
    URL.revokeObjectURL(cropImageUrl);
  };

  const toggleServiceType = (service: string) => {
    setServiceTypes(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        user_id: user.id,
        name,
        bio,
        location: selectedLocation?.address || location,
        avatar_url: avatarUrl,
        phone,
        is_provider: isProvider,
        service_types: serviceTypes.length > 0 ? serviceTypes : null,
        latitude: selectedLocation?.latitude || null,
        longitude: selectedLocation?.longitude || null,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (error) throw error;

      // Refetch user data to update the context
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (updatedProfile && user) {
        // Update the auth context with the new profile data
        const updatedUser = {
          ...user,
          profile: updatedProfile
        };
        
        // Force a context update by triggering a profile fetch
        window.location.reload();
      }

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback className="text-lg">{name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground text-center">
                Click to upload and crop your profile picture
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  maxLength={200}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={selectedLocation?.address || location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowLocationSelector(true)}
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                />
              </div>

              {/* Provider Settings */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="provider" 
                    checked={isProvider}
                    onCheckedChange={(checked) => setIsProvider(checked === true)}
                  />
                  <Label htmlFor="provider" className="text-sm">
                    I'm a service provider
                  </Label>
                </div>

                {isProvider && (
                  <div>
                    <Label>Service Types</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableServices.map((service) => (
                        <Badge
                          key={service}
                          variant={serviceTypes.includes(service) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleServiceType(service)}
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImageCropper
        open={showCropper}
        onOpenChange={setShowCropper}
        imageUrl={cropImageUrl}
        onCropComplete={handleCropComplete}
      />

      <LocationSelector
        open={showLocationSelector}
        onOpenChange={setShowLocationSelector}
        onLocationSelect={(loc) => {
          setSelectedLocation(loc);
          setLocation(loc.address);
        }}
        initialLocation={location}
      />
    </>
  );
};