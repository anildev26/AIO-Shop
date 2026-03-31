"use client";

import { useEffect, useRef } from "react";
import { useProductStore } from "@/stores/productStore";

interface HydratorProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  pricing_tiers: { months: number; price: number }[] | null;
  instructions: string | null;
  image_url: string;
  image_public_id: string | null;
  pinned_image_url: string | null;
  pinned_image_public_id: string | null;
  in_stock: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProductStoreHydrator({ products }: { products: HydratorProduct[] }) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      useProductStore.getState().setProducts(products);
      hydrated.current = true;
    }
  }, [products]);

  return null;
}
