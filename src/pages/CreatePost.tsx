import { useState } from "react";
import { Camera, MapPin, Hash, X, Plus } from "lucide-react";
import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

const serviceCategories = [
  { id: "home", label: "Home Services" },
  { id: "digital", label: "Digital Services" },
  { id: "events", label: "Events" },
  { id: "wellness", label: "Wellness" },
  { id: "business", label: "Business Services" }
];

// Mock user data
const mockUser = {
  name: "Ahmed Al-Rashid",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
};

export default function CreatePost() {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [location, setLocation] = useState("Dubai Marina, Dubai");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [userType, setUserType] = useState<"provider" | "seeker">("provider");

  const handleImageUpload = () => {
    // In real app, would open file picker and upload images
    const mockImage = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300&fit=crop`;
    setSelectedImages([...selectedImages, mockImage]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      setHashtags([...hashtags, newHashtag.trim()]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    
    setIsPosting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real app, would send to API
    console.log("Posting:", {
      content,
      images: selectedImages,
      category: selectedCategory,
      location,
      hashtags
    });
    
    setIsPosting(false);
    
    // Navigate back to feed or show success message
    window.history.back();
  };

  return (
    <Layout title={t('createPost')} showMobileNav={false}>
      <div className="container-mobile py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.history.back()}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handlePost}
            disabled={!content.trim() || isPosting}
            className="px-6"
          >
            {isPosting ? t('posting') : t('post')}
          </Button>
        </div>

        {/* User Type Selection */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium">{t('userType')}</Label>
          <RadioGroup 
            value={userType} 
            onValueChange={(value) => setUserType(value as "provider" | "seeker")}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="provider" id="provider" />
              <Label htmlFor="provider" className="text-sm">
                {t('serviceProvider')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="seeker" id="seeker" />
              <Label htmlFor="seeker" className="text-sm">
                {t('serviceSeeker')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback>{mockUser.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{mockUser.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Content Input */}
        <div className="space-y-4">
          <Textarea
            placeholder={userType === "provider" ? t('whatServiceCompleted') : t('whatServiceNeeded')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 border-0 text-base resize-none focus-visible:ring-0 p-0"
            maxLength={500}
          />
          
          <div className="text-xs text-muted-foreground text-right">
            {content.length}/500
          </div>
        </div>

        {/* Service Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('serviceCategory')}</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Images */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('photos')}</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleImageUpload}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {t('addPhoto')}
            </Button>
          </div>
          
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hashtags */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('tags')}</label>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder={t('addTag')}
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHashtag()}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={20}
              />
            </div>
            <Button onClick={addHashtag} size="sm" disabled={!newHashtag.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeHashtag(tag)}
                >
                  #{tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('location')}</label>
          <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{location}</span>
            <Button variant="ghost" size="sm" className="ml-auto text-primary">
              {t('change')}
            </Button>
          </div>
        </div>

        {/* Privacy & Settings */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm">{t('postSettings')}</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('allowComments')}</span>
            <input type="checkbox" defaultChecked className="accent-primary" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('showContactInfo')}</span>
            <input type="checkbox" defaultChecked className="accent-primary" />
          </div>
        </div>
      </div>
    </Layout>
  );
}