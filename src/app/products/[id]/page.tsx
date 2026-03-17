import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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
  const session = await auth();

  const { id } = await params;

  // Try slug first, then fall back to ID
  const [product, settings] = await Promise.all([
    prisma.product.findFirst({
      where: {
        isVisible: true,
        OR: [{ slug: id }, { id }],
      },
      include: {
        reviews: {
          where: { status: "APPROVED" },
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.settings.findFirst(),
  ]);

  if (!product) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / product.reviews.length
      : null;

  const whatsappLink = settings
    ? buildWhatsAppLink(settings.whatsappNumber, product.name)
    : "#";
  const telegramLink = settings
    ? buildTelegramLink(settings.telegramUsername, product.name)
    : "#";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar user={session?.user ?? null} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-6 inline-block">
          &larr; Back to catalog
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative aspect-[4/3] max-h-[400px] bg-slate-100 dark:bg-slate-800">
              <Image
                src={product.imageUrl}
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
                    product.inStock
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                  }`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {(() => {
                  const tiers = product.pricingTiers as PricingTier[] | null;
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
                    ⭐ {avgRating.toFixed(1)} ({product.reviews.length} reviews)
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contact on WhatsApp
                </a>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Contact on Telegram
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Customer Reviews</h2>

          {product.pinnedImageUrl && (
            <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-4 py-2">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/>
                </svg>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Pinned by Admin</span>
              </div>
              <div className="p-4">
                <div className="relative w-full max-w-md mx-auto">
                  <Image
                    src={product.pinnedImageUrl}
                    alt="Pinned review image"
                    width={600}
                    height={400}
                    className="rounded-lg object-contain w-full h-auto"
                  />
                </div>
              </div>
            </div>
          )}

          {session?.user ? (
            <ReviewForm productId={product.id} userId={session.user.id} />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6 text-center">
              <p className="text-slate-600 dark:text-slate-300 mb-3">Want to leave a review?</p>
              <a href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition">
                Login to Review
              </a>
            </div>
          )}
          <ReviewList reviews={product.reviews} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
