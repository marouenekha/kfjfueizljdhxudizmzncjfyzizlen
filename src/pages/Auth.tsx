import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, Chrome, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { t } = useTranslation();
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    isProvider: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email requis';
    else if (!validateEmail(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (!validatePassword(formData.password)) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Nom requis';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup({ email: formData.email, password: formData.password, name: formData.name, isProvider: formData.isProvider });
      }
      navigate('/feed');
    } catch (error) {
      // handled in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/feed` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Login failed', description: error.message || `Could not sign in with ${provider}`, variant: 'destructive' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const resetForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ email: '', password: '', confirmPassword: '', name: '', isProvider: false });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background to-secondary/20">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary/5 p-12">
        <div className="max-w-md space-y-6 text-center">
          <h1 className="text-4xl font-bold gradient-text">ServiceHub</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Trouvez les meilleurs prestataires locaux ou proposez vos services à votre communauté.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {['🔧 Services', '⭐ Avis', '💬 Messages'].map((item) => (
              <div key={item} className="bg-card/60 backdrop-blur rounded-xl p-4 text-sm font-medium text-foreground shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="flex justify-center mb-4">
            <LanguageSwitcher variant="compact" />
          </div>

          <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {isLogin ? t('login') : t('signup')}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {isLogin ? t('signInWith') + ' ' + t('email') : t('signup') + ' ' + t('email')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-4 sm:px-6">
              {/* Social */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={loading}>
                  <Chrome className="w-4 h-4 mr-2" /> Google
                </Button>
                <Button variant="outline" onClick={() => handleSocialLogin('facebook')} disabled={loading}>
                  <Facebook className="w-4 h-4 mr-2" /> Facebook
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{t('orContinueWith')}</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">{t('fullName')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="name" placeholder={t('fullName')} value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="pl-9" disabled={loading} />
                    </div>
                    {errors.name && <Alert variant="destructive" className="py-2"><AlertDescription className="text-xs">{errors.name}</AlertDescription></Alert>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="votre@email.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="pl-9" disabled={loading} />
                  </div>
                  {errors.email && <Alert variant="destructive" className="py-2"><AlertDescription className="text-xs">{errors.email}</AlertDescription></Alert>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">{t('password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="pl-9 pr-9" disabled={loading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" disabled={loading}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <Alert variant="destructive" className="py-2"><AlertDescription className="text-xs">{errors.password}</AlertDescription></Alert>}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">{t('confirmPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className="pl-9" disabled={loading} />
                    </div>
                    {errors.confirmPassword && <Alert variant="destructive" className="py-2"><AlertDescription className="text-xs">{errors.confirmPassword}</AlertDescription></Alert>}
                  </div>
                )}

                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Chargement...</span>
                    </div>
                  ) : (isLogin ? t('login') : t('signup'))}
                </Button>
              </form>

              <div className="text-center">
                <button type="button" onClick={resetForm} className="text-sm text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                  {isLogin ? t('noAccount') : t('hasAccount')}
                </button>
              </div>

              {isLogin && (
                <div className="text-center">
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors" disabled={loading}>
                    {t('forgotPassword')}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4 px-4">
            En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
