import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CartProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[] | null;
  user_id: string;
  seller_name?: string;
  seller_avatar?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: CartProduct;
}

export const useCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("cart_items")
      .select("id, product_id, quantity, products!inner(id, title, description, price, images, user_id)")
      .eq("user_id", user.id);

    const rows = (data || []) as any[];
    const sellerIds = Array.from(new Set(rows.map((r) => r.products.user_id)));
    let profiles: any[] = [];
    if (sellerIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", sellerIds);
      profiles = profs || [];
    }
    const mapped: CartItem[] = rows.map((r) => {
      const p = profiles.find((pr) => pr.user_id === r.products.user_id);
      return {
        id: r.id,
        product_id: r.product_id,
        quantity: r.quantity,
        product: {
          ...r.products,
          seller_name: p?.name || "Vendeur",
          seller_avatar: p?.avatar_url || undefined,
        },
      };
    });
    setItems(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) return { error: "not_authenticated" };
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await (supabase as any)
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
    } else {
      await (supabase as any)
        .from("cart_items")
        .insert({ user_id: user.id, product_id: productId, quantity });
    }
    await fetch();
    return {};
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(cartItemId);
    await (supabase as any).from("cart_items").update({ quantity }).eq("id", cartItemId);
    await fetch();
  };

  const removeItem = async (cartItemId: string) => {
    await (supabase as any).from("cart_items").delete().eq("id", cartItemId);
    await fetch();
  };

  const clearCart = async () => {
    if (!user) return;
    await (supabase as any).from("cart_items").delete().eq("user_id", user.id);
    await fetch();
  };

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.quantity * Number(i.product.price), 0);

  // Group by seller
  const groupedBySeller = items.reduce((acc, item) => {
    const sid = item.product.user_id;
    if (!acc[sid]) {
      acc[sid] = {
        sellerId: sid,
        sellerName: item.product.seller_name || "",
        sellerAvatar: item.product.seller_avatar,
        items: [],
        subtotal: 0,
      };
    }
    acc[sid].items.push(item);
    acc[sid].subtotal += item.quantity * Number(item.product.price);
    return acc;
  }, {} as Record<string, { sellerId: string; sellerName: string; sellerAvatar?: string; items: CartItem[]; subtotal: number }>);

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refresh: fetch,
    totalCount,
    totalPrice,
    groupedBySeller: Object.values(groupedBySeller),
  };
};
