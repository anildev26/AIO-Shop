import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ProductCard from "@/components/shop/ProductCard";
import Navbar from "@/components/shop/Navbar";
import Footer from "@/components/shop/Footer";
import SearchSort from "@/components/shop/SearchSort";
import DashboardTabs from "@/components/shop/DashboardTabs";
import ContactTab from "@/components/shop/ContactTab";
import FeedbackTab from "@/components/shop/FeedbackTab";
import WelcomeModal from "@/components/shop/WelcomeModal";
import Logo from "@/components/Logo";
import type { PricingTier } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ search?: string; sort?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();

  const { search, sort } = await searchParams;

  const [products, allReviews, settings, feedbackReviews] = await Promise.all([
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
    prisma.review.findMany({
      where: { status: "APPROVED" },
      include: {
        user: { select: { username: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const totalSold = settings?.productsSold ?? 0;
  const avgQuality = allReviews.length > 0
    ? allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length
    : null;

  const productsContent = (
    <>
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
    </>
  );

  const serializedReviews = feedbackReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    user: r.user,
    product: r.product,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar user={session?.user ?? null} />
      <WelcomeModal whatsappNumber={settings?.whatsappNumber} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo size={48} />
            <div>
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">All In One Shop</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">All-in-one digital store</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Trusted &bull; Affordable &bull; Verified</p>
            </div>
          </div>
          <div className="flex items-center gap-6 sm:gap-8">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Products Sold</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalSold}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Product Quality</p>
              {avgQuality ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{avgQuality.toFixed(1)}</span>
                  <span className="text-sm tracking-tight">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= Math.round(avgQuality) ? "text-yellow-400" : "text-slate-300 dark:text-slate-600"}>★</span>
                    ))}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    ({allReviews.length} {allReviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-slate-800 dark:text-white">N/A</p>
              )}
            </div>
          </div>
        </div>

        <DashboardTabs
          productsTab={productsContent}
          contactTab={
            <ContactTab
              whatsappNumber={settings?.whatsappNumber}
              telegramUsername={settings?.telegramUsername}
            />
          }
          feedbackTab={<FeedbackTab reviews={serializedReviews} />}
        />
      </main>
      <Footer />
    </div>
  );
}
