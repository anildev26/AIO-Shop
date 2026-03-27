import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createServiceSupabase } from "@/lib/supabase/server";

const pricingTierSchema = z.object({
  months: z.number().int().positive(),
  price: z.number().positive(),
});

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive().optional(),
  pricingTiers: z.array(pricingTierSchema).min(1).optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().optional(),
  inStock: z.boolean().default(true),
  isVisible: z.boolean().default(true),
}).refine(
  (data) => data.price !== undefined || (data.pricingTiers && data.pricingTiers.length > 0),
  { message: "Either price or pricing tiers must be provided" }
);

export async function GET() {
  const supabase = await createServiceSupabase();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = { ...parsed.data };

  if (data.pricingTiers && data.pricingTiers.length > 0) {
    data.price = Math.min(...data.pricingTiers.map((t) => t.price));
  }

  let slug = slugify(data.name);
  const supabase = await createServiceSupabase();
  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      slug,
      description: data.description,
      price: data.price!,
      pricing_tiers: data.pricingTiers || null,
      instructions: data.instructions || null,
      image_url: data.imageUrl,
      image_public_id: data.imagePublicId || null,
      in_stock: data.inStock,
      is_visible: data.isVisible,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(product, { status: 201 });
}
