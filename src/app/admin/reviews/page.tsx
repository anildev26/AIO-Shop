import { createServiceSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReviewModerationTable from "@/components/admin/ReviewModerationTable";

export default async function AdminReviewsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");

  const supabase = await createServiceSupabase();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, status, created_at, user_id, product_id")
    .order("created_at", { ascending: false });

  const reviewsList = reviews || [];

  // Fetch user and product names
  let mappedReviews: { id: string; rating: number; comment: string; status: string; createdAt: string; user: { username: string }; product: { name: string } }[] = [];
  if (reviewsList.length > 0) {
    const userIds = [...new Set(reviewsList.map((r) => r.user_id))];
    const productIds = [...new Set(reviewsList.map((r) => r.product_id))];

    const [{ data: users }, { data: products }] = await Promise.all([
      supabase.from("profiles").select("id, username").in("id", userIds),
      supabase.from("products").select("id, name").in("id", productIds),
    ]);

    const userMap = new Map((users || []).map((u) => [u.id, u.username]));
    const productMap = new Map((products || []).map((p) => [p.id, p.name]));

    mappedReviews = reviewsList.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.created_at,
      user: { username: userMap.get(r.user_id) || "Unknown" },
      product: { name: productMap.get(r.product_id) || "Unknown" },
    }));
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Moderate Reviews</Link>
        <Link href="/admin" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Admin</Link>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ReviewModerationTable reviews={mappedReviews} />
      </main>
    </div>
  );
}
