import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'default' }) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'ar', flag: '🇸🇦', name: 'العربية' },
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'en', flag: '🇺🇸', name: 'English' }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
  };

  if (variant === 'compact') {
    return (
      <div className="flex gap-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={i18n.language === lang.code ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLanguageChange(lang.code)}
            className="w-10 h-10 p-0"
          >
            <span className="text-lg">{lang.flag}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={i18n.language === lang.code ? 'default' : 'outline'}
          onClick={() => handleLanguageChange(lang.code)}
          className="justify-start gap-3"
        >
          <span className="text-lg">{lang.flag}</span>
          <span>{lang.name}</span>
        </Button>
      ))}
    </div>
  );
};