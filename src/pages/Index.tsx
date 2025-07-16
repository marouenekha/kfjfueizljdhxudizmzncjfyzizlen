import { useState } from "react";
import { ArrowRight, Star, Users, Shield, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ar", label: "العربية", flag: "🇦🇪", dir: "rtl" },
    { code: "fr", label: "Français", flag: "🇫🇷" }
  ];

  const features = [
    {
      icon: Users,
      title: "Connect with Local Providers",
      description: "Find verified service providers in your area for any type of service you need."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Built-in payment system with escrow protection for safe transactions."
    },
    {
      icon: Star,
      title: "Quality Guaranteed",
      description: "Read reviews and ratings from real customers to make informed decisions."
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      description: "Use the app in English, Arabic, or French with full RTL support."
    }
  ];

  const serviceCategories = [
    { name: "Home Services", color: "bg-service-home", count: "500+" },
    { name: "Digital Services", color: "bg-service-digital", count: "300+" },
    { name: "Events", color: "bg-service-events", count: "200+" },
    { name: "Wellness", color: "bg-service-wellness", count: "150+" },
    { name: "Business", color: "bg-service-business", count: "250+" }
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
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all ${
                      selectedLanguage === lang.code 
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
              ✨ Launching in Dubai & Abu Dhabi
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">ServiceHub</span>
              <br />
              <span className="text-2xl md:text-4xl font-normal text-muted-foreground">
                Your Local Services Marketplace
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with trusted local service providers for everything from home repairs to digital design. 
              Safe, secure, and multilingual.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="group px-8 py-3 text-lg">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                I'm a Provider
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">Jobs Done</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse Service Categories</h2>
            <p className="text-muted-foreground">Find the perfect provider for any service you need</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {serviceCategories.map((category) => (
              <Card key={category.name} className="p-6 text-center hover:shadow-lg transition-all cursor-pointer group">
                <div className={`w-16 h-16 ${category.color} rounded-xl mx-auto mb-4 flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform`}>
                  📱
                </div>
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} providers</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ServiceHub?</h2>
            <p className="text-muted-foreground">Built for the modern local services economy</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of satisfied customers and providers</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3">
              Find Services
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Become a Provider
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ServiceHub. All rights reserved.</p>
          <p className="mt-2">🇦🇪 Made in UAE • Available in English, العربية, and Français</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
