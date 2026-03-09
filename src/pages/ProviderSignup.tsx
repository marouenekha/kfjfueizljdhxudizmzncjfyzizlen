import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout } from "@/components/Layout/Layout";
import { ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function ProviderSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ businessName: "", email: "", phone: "", category: "", description: "", experience: "", location: "", agreeToTerms: false });

  const categoryKeys = ["homeServices", "digitalServices", "events", "wellness", "business"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) { toast({ title: t('termsRequired'), description: t('pleaseAgreeTerms'), variant: "destructive" }); return; }
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: t('applicationSubmitted'), description: t('applicationSubmittedDesc') });
      navigate('/feed');
    } catch { toast({ title: t('error'), description: t('failedToSubmit'), variant: "destructive" }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Layout title={t('becomeAProvider')} showMobileNav={false}>
      <div className="w-full max-w-2xl mx-auto px-4 py-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />{t('backToHome')}</Button>
        <Card>
          <CardHeader><CardTitle>{t('joinAsProvider')}</CardTitle><CardDescription>{t('joinAsProviderDesc')}</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="businessName">{t('businessName')} *</Label><Input id="businessName" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} placeholder={t('yourBusinessName')} required /></div>
                <div className="space-y-2"><Label htmlFor="email">{t('emailAddress')} *</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder={t('email')} required /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="phone">{t('phoneNumber')} *</Label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+971 50 123 4567" required /></div>
                <div className="space-y-2"><Label htmlFor="category">{t('serviceCategory')} *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger><SelectValue placeholder={t('selectCategory')} /></SelectTrigger>
                    <SelectContent>{categoryKeys.map((key) => <SelectItem key={key} value={t(key)}>{t(key)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="location">{t('serviceLocation')} *</Label><Input id="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Dubai, UAE" required /></div>
              <div className="space-y-2"><Label htmlFor="experience">{t('yearsExperience')} *</Label><Input id="experience" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} placeholder={t('yearsExperienceExample')} required /></div>
              <div className="space-y-2"><Label htmlFor="description">{t('businessDescription')} *</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder={t('businessDescriptionPlaceholder')} rows={4} required /></div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">{t('uploadDocs')}</p>
                  <Button type="button" variant="outline" size="sm">{t('chooseFiles')}</Button>
                  <p className="text-xs text-muted-foreground mt-2">{t('docsOptional')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" checked={formData.agreeToTerms} onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked as boolean})} />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="terms" className="text-sm">{t('agreeTerms')} *</Label>
                  <p className="text-xs text-muted-foreground">{t('agreeTermsDesc')}</p>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? t('submittingApplication') : t('submitApplication')}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
