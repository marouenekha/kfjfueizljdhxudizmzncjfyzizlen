import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

export const StoreTab = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12 space-y-4">
      <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{t('noStoreItems')}</h3>
      <p className="text-sm text-muted-foreground">{t('noStoreItemsDesc')}</p>
    </div>
  );
};
