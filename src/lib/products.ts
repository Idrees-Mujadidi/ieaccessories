import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export const CATEGORIES = ["Power Banks", "Chargers", "Phone Cases"] as const;

// Shop contact — change to your real WhatsApp number (country code, digits only).
export const WHATSAPP_NUMBER = "9370555002";
export const INSTAGRAM_URL = "https://instagram.com/";

const priceFormatter = new Intl.NumberFormat("en-AF", {
  style: "currency",
  currency: "AFN",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(price: number) {
  return priceFormatter.format(price);
}

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export function orderLink(p?: Pick<Product, "name" | "price">) {
  const text = p
    ? `Hi ie accessories! I'd like to order: ${p.name} (${formatPrice(Number(p.price))})`
    : "Hi ie accessories! I'd like to place an order.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Shrinks a picked image to a compact WebP data URL so it can be saved with the product. */
export function fileToDataUrl(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/webp", 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
