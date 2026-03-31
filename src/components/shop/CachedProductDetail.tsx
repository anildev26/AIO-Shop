"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProductStore, type Product } from "@/stores/productStore";
import { createClient } from "@/lib/supabase/client";
import ReviewForm from "@/components/shop/ReviewForm";
import ReviewList from "@/components/shop/ReviewList";
import { formatPrice, buildWhatsAppLink, buildTelegramLink, type PricingTier } from "@/lib/utils";

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { username: string };
}

interface UserInfo {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface Props {
  idOrSlug: string;
}

export default function CachedProductDetail({ idOrSlug }: Props) {
  const cachedProduct = useProductStore((s) => s.getProduct(idOrSlug));
  const isLoaded = useProductStore((s) => s.isLoaded);

  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [contactInfo, setContactInfo] = useState<{ whatsappNumber: string; telegramUsername: string } | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Get user session client-side
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          username: data.user.user_metadata?.username || "User",
          role: "USER",
        });
      }
    });
  }, []);

  // Use cached product if available, otherwise fetch
  useEffect(() => {
    if (cachedProduct) {
      setProduct(cachedProduct);
      setLoading(false);
    } else if (!isLoaded || !cachedProduct) {
      fetch(`/api/products/${idOrSlug}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setProduct(data);
          setLoading(false);
        });
    }
  }, [cachedProduct, isLoaded, idOrSlug]);

  // Fetch reviews and contact info
  useEffect(() => {
    if (!product) return;

    Promise.all([
      fetch(`/api/products/${product.id}/reviews`).then((r) => r.json()),
      fetch("/api/settings/public").then((r) => r.json()),
    ]).then(([reviewData, settingsData]) => {
      setReviews(reviewData.reviews || []);
      setAvgRating(reviewData.avgRating || null);
      setContactInfo(settingsData);
      setReviewsLoading(false);
    });
  }, [product]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="aspect-[4/3] max-h-[400px] bg-slate-200 dark:bg-slate-800" />
              <div className="p-8 space-y-4">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">Product not found.</p>
        <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-4 inline-block">
          &larr; Back to catalog
        </Link>
      </main>
    );
  }

  const tiers = product.pricing_tiers as PricingTier[] | null;
  const whatsappLink = contactInfo
    ? buildWhatsAppLink(contactInfo.whatsappNumber, product.name)
    : "#";
  const telegramLink = contactInfo
    ? buildTelegramLink(contactInfo.telegramUsername, product.name)
    : "#";

  return (
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
              priority
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
                  ★ {avgRating.toFixed(1)} ({reviews.length} reviews)
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

        {reviewsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
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
            <ReviewList reviews={reviews} />
          </>
        )}
      </div>
    </main>
  );
}
