import { createServiceSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import type { PricingTier } from "@/lib/utils";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");

  const { id } = await params;
  const supabase = await createServiceSupabase();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  // Map snake_case to camelCase for ProductForm
  const mappedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    pricingTiers: product.pricing_tiers as unknown as PricingTier[] | null,
    instructions: product.instructions,
    imageUrl: product.image_url,
    imagePublicId: product.image_public_id,
    pinnedImageUrl: product.pinned_image_url,
    pinnedImagePublicId: product.pinned_image_public_id,
    inStock: product.in_stock,
    isVisible: product.is_visible,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Edit Product</Link>
        <Link href="/admin/products" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Products</Link>
      </nav>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <ProductForm product={mappedProduct} />
      </main>
    </div>
  );
}
