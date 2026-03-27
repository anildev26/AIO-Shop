import { createServiceSupabase } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/shop/Navbar";
import ReviewForm from "@/components/shop/ReviewForm";
import ReviewList from "@/components/shop/ReviewList";
import Footer from "@/components/shop/Footer";
import { formatPrice, buildWhatsAppLink, buildTelegramLink, type PricingTier } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const user = await getUser();
  const { id } = await params;
  const supabase = await createServiceSupabase();

  // Try slug first, then fall back to ID
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("is_visible", true)
    .or(`slug.eq.${id},id.eq.${id}`)
    .single();

  if (!product) notFound();

  const [{ data: reviews }, { data: settings }] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at, user_id")
      .eq("product_id", product.id)
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false }),
    supabase.from("settings").select("*").limit(1).single(),
  ]);

  const reviewsList = reviews || [];

  // Fetch usernames for reviews
  let reviewsWithUsers: { id: string; rating: number; comment: string; createdAt: string; user: { username: string } }[] = [];
  if (reviewsList.length > 0) {
    const userIds = [...new Set(reviewsList.map((r) => r.user_id))];
    const { data: users } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    const userMap = new Map((users || []).map((u) => [u.id, u.username]));

    reviewsWithUsers = reviewsList.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      user: { username: userMap.get(r.user_id) || "Unknown" },
    }));
  }

  const avgRating =
    reviewsList.length > 0
      ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length
      : null;

  const whatsappLink = settings
    ? buildWhatsAppLink(settings.whatsapp_number, product.name)
    : "#";
  const telegramLink = settings
    ? buildTelegramLink(settings.telegram_username, product.name)
    : "#";

  const tiers = product.pricing_tiers as PricingTier[] | null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-6 inline-block">
          &larr; Back to catalog
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative aspect-[4/3] max-h-[400px] bg-slate-100 dark:bg-slate-800">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>

            <div className="p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{product.name}</h1>
                  <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                    product.in_stock
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                  }`}>
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {(() => {
                  if (tiers && tiers.length > 0) {
                    const sorted = [...tiers].sort((a, b) => a.months - b.months);
                    return (
                      <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2">
                          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pricing Plans</h3>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {sorted.map((tier) => (
                            <div key={tier.months} className="flex items-center justify-between px-4 py-3">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {tier.months} {tier.months === 1 ? "Month" : "Months"}
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                {formatPrice(tier.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-3">
                      {formatPrice(product.price)}
                    </p>
                  );
                })()}

                {avgRating && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    ★ {avgRating.toFixed(1)} ({reviewsList.length} reviews)
                  </p>
                )}

                <p className="text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{product.description}</p>

                {product.instructions && (
                  <div className="mt-6 bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Instructions</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line">{product.instructions}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Interested? Contact the seller:</p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition"
                >
                  Contact on WhatsApp
                </a>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition"
                >
                  Contact on Telegram
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Customer Reviews</h2>

          {product.pinned_image_url && (
            <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-4 py-2">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Pinned by Admin</span>
              </div>
              <div className="p-4">
                <div className="relative w-full max-w-md mx-auto">
                  <Image
                    src={product.pinned_image_url}
                    alt="Pinned review image"
                    width={600}
                    height={400}
                    className="rounded-lg object-contain w-full h-auto"
                  />
                </div>
              </div>
            </div>
          )}

          {user ? (
            <ReviewForm productId={product.id} userId={user.id} />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6 text-center">
              <p className="text-slate-600 dark:text-slate-300 mb-3">Want to leave a review?</p>
              <a href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition">
                Login to Review
              </a>
            </div>
          )}
          <ReviewList reviews={reviewsWithUsers} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
