import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = typeof STATUSES[number];

interface OrderItem {
  id: string;
  title_snapshot: string;
  price_snapshot: number;
  image_snapshot: string | null;
  quantity: number;
}
interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: Status;
  total: number;
  full_name: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  note: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const Orders = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data: bo } = await (supabase as any)
      .from("orders")
      .select("*, order_items(*)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });
    const { data: so } = await (supabase as any)
      .from("orders")
      .select("*, order_items(*)")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setBuyerOrders((bo || []) as Order[]);
    setSellerOrders((so || []) as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await (supabase as any).from("orders").update({ status }).eq("id", id);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else {
      toast({ title: t("statusUpdated") });
      fetchOrders();
    }
  };

  const renderOrder = (o: Order, asSeller: boolean) => (
    <div key={o.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          o.status === "delivered" ? "bg-green-500/15 text-green-700" :
          o.status === "cancelled" ? "bg-destructive/15 text-destructive" :
          "bg-primary/15 text-primary"
        }`}>
          {t(`status_${o.status}`)}
        </span>
      </div>
      <div className="space-y-1">
        {o.order_items?.map((it) => (
          <div key={it.id} className="flex gap-2 items-center">
            <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
              {it.image_snapshot && <img src={it.image_snapshot} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0 text-sm">
              <p className="truncate">{it.title_snapshot}</p>
              <p className="text-xs text-muted-foreground">
                {it.quantity} × {Number(it.price_snapshot).toFixed(2)} DA
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground border-t border-border pt-2 space-y-0.5">
        <p><strong>{o.full_name}</strong> · {o.phone}</p>
        <p>{o.address}, {o.commune}, {o.wilaya}</p>
        {o.note && <p className="italic">"{o.note}"</p>}
      </div>
      <div className="flex justify-between items-center pt-1">
        <span className="font-bold text-primary">{Number(o.total).toFixed(2)} DA</span>
        {asSeller && o.status !== "delivered" && o.status !== "cancelled" && (
          <div className="flex gap-1 flex-wrap justify-end">
            {STATUSES.filter((s) => s !== o.status).map((s) => (
              <Button key={s} size="sm" variant="outline" className="h-7 text-xs"
                onClick={() => updateStatus(o.id, s)}>
                {t(`status_${s}`)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout title={t("myOrders")} showHeader={false}>
      <div className="max-w-2xl mx-auto pb-20">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center h-14 px-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="ml-2 font-semibold">{t("myOrders")}</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="buyer" className="p-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buyer">{t("myPurchases")}</TabsTrigger>
              <TabsTrigger value="seller">{t("salesReceived")}</TabsTrigger>
            </TabsList>
            <TabsContent value="buyer" className="space-y-3 mt-4">
              {buyerOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  {t("noOrders")}
                </div>
              ) : buyerOrders.map((o) => renderOrder(o, false))}
            </TabsContent>
            <TabsContent value="seller" className="space-y-3 mt-4">
              {sellerOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  {t("noSales")}
                </div>
              ) : sellerOrders.map((o) => renderOrder(o, true))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
