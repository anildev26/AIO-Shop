import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { PricingTier } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug?: string | null;
  price: number;
  pricingTiers?: PricingTier[] | null;
  imageUrl: string;
  inStock: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const tiers = product.pricingTiers as PricingTier[] | null;
  const hasTiers = tiers && tiers.length > 0;
  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <Link href={productUrl}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer">
        <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className="p-2 sm:p-3">
          <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white truncate">{product.name}</h3>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm mt-0.5">
            {hasTiers ? `From ${formatPrice(product.price)}` : formatPrice(product.price)}
          </p>
          <span className={`inline-block mt-1 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            product.inStock
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
          }`}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
