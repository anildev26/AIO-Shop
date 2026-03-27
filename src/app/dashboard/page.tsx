import { createServiceSupabase } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/auth-helpers";
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
  const user = await getUser();
  const { search, sort } = await searchParams;
  const supabase = await createServiceSupabase();

  // Build products query
  let productsQuery = supabase
    .from("products")
    .select("*")
    .eq("is_visible", true);

  if (search) {
    productsQuery = productsQuery.ilike("name", `%${search}%`);
  }

  if (sort === "price_asc") {
    productsQuery = productsQuery.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    productsQuery = productsQuery.order("price", { ascending: false });
  } else if (sort === "oldest") {
    productsQuery = productsQuery.order("created_at", { ascending: true });
  } else {
    productsQuery = productsQuery.order("created_at", { ascending: false });
  }

  const [
    { data: products },
    { data: allReviews },
    { data: settings },
    { data: feedbackReviews },
  ] = await Promise.all([
    productsQuery,
    supabase.from("reviews").select("rating").eq("status", "APPROVED"),
    supabase.from("settings").select("*").limit(1).single(),
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at, user_id, product_id")
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // Fetch user and product names for feedback reviews
  let serializedReviews: { id: string; rating: number; comment: string; user: { username: string }; product: { name: string }; createdAt: string }[] = [];
  if (feedbackReviews && feedbackReviews.length > 0) {
    const userIds = [...new Set(feedbackReviews.map((r) => r.user_id))];
    const productIds = [...new Set(feedbackReviews.map((r) => r.product_id))];

    const [{ data: users }, { data: reviewProducts }] = await Promise.all([
      supabase.from("profiles").select("id, username").in("id", userIds),
      supabase.from("products").select("id, name").in("id", productIds),
    ]);

    const userMap = new Map((users || []).map((u) => [u.id, u.username]));
    const productMap = new Map((reviewProducts || []).map((p) => [p.id, p.name]));

    serializedReviews = feedbackReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      user: { username: userMap.get(r.user_id) || "Unknown" },
      product: { name: productMap.get(r.product_id) || "Unknown" },
      createdAt: r.created_at,
    }));
  }

  const productsList = products || [];
  const reviewsList = allReviews || [];
  const totalSold = settings?.products_sold ?? 0;
  const avgQuality = reviewsList.length > 0
    ? reviewsList.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsList.length
    : null;

  const productsContent = (
    <>
      <SearchSort />
      {productsList.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg">No products found.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 [&>*]:min-w-[120px] [&>*]:flex-1 [&>*]:max-w-[180px] sm:[&>*]:max-w-[200px] lg:[&>*]:max-w-[220px]">
          {productsList.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price,
                pricingTiers: product.pricing_tiers as unknown as PricingTier[] | null,
                imageUrl: product.image_url,
                inStock: product.in_stock,
                isVisible: product.is_visible,
              }}
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar user={user} />
      <WelcomeModal whatsappNumber={settings?.whatsapp_number} />
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
                    ({reviewsList.length} {reviewsList.length === 1 ? "review" : "reviews"})
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
              whatsappNumber={settings?.whatsapp_number}
              telegramUsername={settings?.telegram_username}
            />
          }
          feedbackTab={<FeedbackTab reviews={serializedReviews} />}
        />
      </main>
      <Footer />
    </div>
  );
}
