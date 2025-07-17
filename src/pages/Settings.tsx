import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t } = useTranslation();

  return (
    <Layout title={t('settings')}>
      <div className="container-mobile space-y-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌐 {t('language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('selectLanguage')}</p>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}