import { useState } from "react";
import { ArrowRight, Star, Users, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ar", label: "العربية", flag: "🇦🇪" },
    { code: "fr", label: "Français", flag: "🇫🇷" }
  ];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  };

  const features = [
    { icon: Users, titleKey: "connectProviders", descKey: "connectProvidersDesc" },
    { icon: Shield, titleKey: "securePayments", descKey: "securePaymentsDesc" },
    { icon: Star, titleKey: "qualityGuaranteed", descKey: "qualityGuaranteedDesc" },
    { icon: Globe, titleKey: "multilingualSupport", descKey: "multilingualSupportDesc" }
  ];

  const serviceCategories = [
    { nameKey: "homeServices", color: "bg-service-home", count: "500+" },
    { nameKey: "digitalServices", color: "bg-service-digital", count: "300+" },
    { nameKey: "events", color: "bg-service-events", count: "200+" },
    { nameKey: "wellness", color: "bg-service-wellness", count: "150+" },
    { nameKey: "business", color: "bg-service-business", count: "250+" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-40"></div>
        
        <div className="relative px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Language Selector */}
            <div className="flex justify-center mb-8">
              <div className="flex gap-2 p-1 bg-background/80 backdrop-blur rounded-full border border-border">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all ${
                      i18n.language === lang.code 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur">
              {t('launchingBadge')}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">ServiceHub</span>
              <br />
              <span className="text-2xl md:text-4xl font-normal text-muted-foreground">
                {t('heroTitle')}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="group px-8 py-3 text-lg" onClick={() => navigate('/auth')}>
                {t('getStarted')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg" onClick={() => navigate('/provider-signup')}>
                {t('imAProvider')}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">{t('providers')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">{t('jobsDone')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9</div>
                <div className="text-sm text-muted-foreground">{t('avgRating')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('browseCategories')}</h2>
            <p className="text-muted-foreground">{t('browseCategoriesDesc')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {serviceCategories.map((category) => (
              <Card key={category.nameKey} className="p-6 text-center hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate(`/search?category=${encodeURIComponent(t(category.nameKey))}`)}>
                <div className={`w-16 h-16 ${category.color} rounded-xl mx-auto mb-4 flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform`}>
                  📱
                </div>
                <h3 className="font-semibold mb-2">{t(category.nameKey)}</h3>
                <p className="text-sm text-muted-foreground">{category.count} {t('providersCount')}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('whyChoose')}</h2>
            <p className="text-muted-foreground">{t('whyChooseDesc')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.titleKey} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t(feature.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t('readyToStart')}</h2>
          <p className="text-muted-foreground mb-8">{t('readyToStartDesc')}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3" onClick={() => navigate('/search')}>
              {t('findServices')}
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3" onClick={() => navigate('/provider-signup')}>
              {t('becomeProvider')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ServiceHub. {t('allRightsReserved')}</p>
          <p className="mt-2">{t('madeInUAE')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
