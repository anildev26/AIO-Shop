import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ProductCard from "@/components/shop/ProductCard";
import Navbar from "@/components/shop/Navbar";
import Footer from "@/components/shop/Footer";
import SearchSort from "@/components/shop/SearchSort";
import type { PricingTier } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ search?: string; sort?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();

  const { search, sort } = await searchParams;

  const [products, allReviews, settings] = await Promise.all([
    prisma.product.findMany({
      where: {
        isVisible: true,
        ...(search
          ? { name: { contains: search, mode: "insensitive" } }
          : {}),
      },
      orderBy:
        sort === "price_asc"
          ? { price: "asc" }
          : sort === "price_desc"
          ? { price: "desc" }
          : sort === "oldest"
          ? { createdAt: "asc" }
          : { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { status: "APPROVED" },
      select: { rating: true },
    }),
    prisma.settings.findFirst(),
  ]);

  const totalSold = settings?.productsSold ?? 0;
  const avgQuality = allReviews.length > 0
    ? allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session?.user ?? null} />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Product Catalog</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{products.length} products available</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalSold}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Products Sold</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center">
              {avgQuality ? (
                <>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg font-bold text-yellow-500 dark:text-yellow-400">{avgQuality.toFixed(1)}</span>
                    <span className="text-sm tracking-tight">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= Math.round(avgQuality) ? "text-yellow-400" : "text-slate-300 dark:text-slate-600"}>★</span>
                      ))}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    ({allReviews.length} {allReviews.length === 1 ? "review" : "reviews"})
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-yellow-500 dark:text-yellow-400">N/A</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">No reviews</p>
                </>
              )}
            </div>
          </div>
        </div>

        <SearchSort />

        {products.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">No products found.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 [&>*]:min-w-[120px] [&>*]:flex-1 [&>*]:max-w-[180px] sm:[&>*]:max-w-[200px] lg:[&>*]:max-w-[220px]">
            {products.map((product: (typeof products)[number]) => (
              <ProductCard key={product.id} product={{ ...product, pricingTiers: product.pricingTiers as unknown as PricingTier[] | null }} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
