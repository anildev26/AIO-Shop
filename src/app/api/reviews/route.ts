import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/auth-helpers";
import { createServiceSupabase } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = await createServiceSupabase();
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      product_id: parsed.data.productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      user_id: user.id,
      status: "PENDING",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(review, { status: 201 });
}
