import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createServiceSupabase } from "@/lib/supabase/server";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const pricingTierSchema = z.object({
  months: z.number().int().positive(),
  price: z.number().positive(),
});

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().positive().optional(),
  pricingTiers: z.array(pricingTierSchema).min(1).optional().nullable(),
  instructions: z.string().optional().nullable(),
  imageUrl: z.string().url(),
  pinnedImageUrl: z.string().url().optional().nullable(),
  inStock: z.boolean().default(true),
  isVisible: z.boolean().default(true),
}).refine(
  (data) => data.price !== undefined || (data.pricingTiers && data.pricingTiers.length > 0),
  { message: "Either price or pricing tiers must be provided" }
);

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let products: unknown[];
  try {
    const text = await file.text();
    products = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
  }

  if (!Array.isArray(products)) {
    return NextResponse.json({ error: "File must contain a JSON array" }, { status: 400 });
  }

  const supabase = await createServiceSupabase();

  const { data: existing } = await supabase
    .from("products")
    .select("name");

  const existingNames = new Set((existing || []).map((p) => p.name.toLowerCase()));

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < products.length; i++) {
    const parsed = productSchema.safeParse(products[i]);
    if (!parsed.success) {
      errors.push(`Product ${i + 1}: ${parsed.error.errors[0]?.message || "Invalid data"}`);
      continue;
    }

    const data = parsed.data;

    if (existingNames.has(data.name.toLowerCase())) {
      skipped++;
      continue;
    }

    if (data.pricingTiers && data.pricingTiers.length > 0) {
      data.price = Math.min(...data.pricingTiers.map((t) => t.price));
    }

    const slug = slugify(data.name) + (existingNames.has(slugify(data.name)) ? `-${Date.now().toString(36)}` : "");

    const { error } = await supabase.from("products").insert({
      name: data.name,
      slug,
      description: data.description,
      price: data.price!,
      pricing_tiers: data.pricingTiers || null,
      instructions: data.instructions || null,
      image_url: data.imageUrl,
      pinned_image_url: data.pinnedImageUrl || null,
      in_stock: data.inStock,
      is_visible: data.isVisible,
    });

    if (error) {
      errors.push(`Product ${i + 1}: ${error.message}`);
      continue;
    }

    existingNames.add(data.name.toLowerCase());
    imported++;
  }

  return NextResponse.json({ imported, skipped, errors });
}
