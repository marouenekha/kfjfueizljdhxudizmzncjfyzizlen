import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Truck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout/Layout";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { groupedBySeller, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    wilaya: "",
    commune: "",
    address: "",
    note: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!user) return navigate("/auth");
    if (!form.full_name || !form.phone || !form.wilaya || !form.commune || !form.address) {
      toast({ title: t("missingFields"), variant: "destructive" });
      return;
    }
    if (groupedBySeller.length === 0) return;
    setSubmitting(true);

    try {
      for (const group of groupedBySeller) {
        const { data: order, error } = await (supabase as any)
          .from("orders")
          .insert({
            buyer_id: user.id,
            seller_id: group.sellerId,
            status: "pending",
            total: group.subtotal,
            payment_method: "cod",
            ...form,
          })
          .select()
          .single();
        if (error) throw error;
        const itemsPayload = group.items.map((it) => ({
          order_id: order.id,
          product_id: it.product.id,
          title_snapshot: it.product.title,
          price_snapshot: Number(it.product.price),
          image_snapshot: it.product.images?.[0] || null,
          quantity: it.quantity,
        }));
        const { error: e2 } = await (supabase as any).from("order_items").insert(itemsPayload);
        if (e2) throw e2;
      }
      await clearCart();
      toast({ title: t("orderPlaced"), description: t("orderPlacedDesc") });
      navigate("/orders");
    } catch (err: any) {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (groupedBySeller.length === 0) {
    return (
      <Layout title={t("checkout")} showHeader={false}>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <p className="text-muted-foreground">{t("cartEmpty")}</p>
          <Button className="mt-4" onClick={() => navigate("/feed")}>{t("backToHome")}</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t("checkout")} showHeader={false} showMobileNav={false}>
      <div className="max-w-2xl mx-auto pb-28">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center h-14 px-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="ml-2 font-semibold">{t("checkout")}</h1>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Order summary */}
          <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
            <h3 className="font-semibold text-sm">{t("orderSummary")}</h3>
            {groupedBySeller.map((g) => (
              <div key={g.sellerId} className="text-sm">
                <p className="text-xs text-muted-foreground">{g.sellerName}</p>
                {g.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span className="truncate pr-2">{it.product.title} × {it.quantity}</span>
                    <span>{(Number(it.product.price) * it.quantity).toFixed(2)} DA</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-border font-bold">
              <span>{t("total")}</span>
              <span className="text-primary">{totalPrice.toFixed(2)} DA</span>
            </div>
          </div>

          {/* Delivery info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{t("deliveryInfo")}</h3>
            <div>
              <Label>{t("fullName")}</Label>
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            </div>
            <div>
              <Label>{t("phone")}</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t("wilaya")}</Label>
                <Input value={form.wilaya} onChange={(e) => update("wilaya", e.target.value)} />
              </div>
              <div>
                <Label>{t("commune")}</Label>
                <Input value={form.commune} onChange={(e) => update("commune", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{t("address")}</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div>
              <Label>{t("noteOptional")}</Label>
              <Textarea rows={2} value={form.note} onChange={(e) => update("note", e.target.value)} />
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-lg border-2 border-primary p-3 bg-primary/5 flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{t("cashOnDelivery")}</p>
              <p className="text-xs text-muted-foreground">{t("cashOnDeliveryDesc")}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-40">
          <div className="max-w-2xl mx-auto">
            <Button className="w-full" disabled={submitting} onClick={submit}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("placeOrder")} — {totalPrice.toFixed(2)} DA
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
