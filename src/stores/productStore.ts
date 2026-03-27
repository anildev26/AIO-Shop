import { create } from "zustand";

export interface PricingTier {
  months: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  pricing_tiers: PricingTier[] | null;
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

interface ProductState {
  products: Product[];
  isLoaded: boolean;
  isLoading: boolean;
  setProducts: (products: Product[]) => void;
  getProduct: (idOrSlug: string) => Product | undefined;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoaded: false,
  isLoading: false,

  setProducts: (products) => set({ products, isLoaded: true, isLoading: false }),

  getProduct: (idOrSlug) => {
    const { products } = get();
    return products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  },

  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),

  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
