import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServiceSupabase();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, user_id")
    .eq("product_id", id)
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviewsList = reviews || [];

  if (reviewsList.length === 0) {
    return NextResponse.json({ reviews: [], avgRating: null });
  }

  // Fetch usernames
  const userIds = [...new Set(reviewsList.map((r) => r.user_id))];
  const { data: users } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", userIds);

  const userMap = new Map((users || []).map((u) => [u.id, u.username]));

  const reviewsWithUsers = reviewsList.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    user: { username: userMap.get(r.user_id) || "Unknown" },
  }));

  const avgRating =
    reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length;

  return NextResponse.json({ reviews: reviewsWithUsers, avgRating });
}
