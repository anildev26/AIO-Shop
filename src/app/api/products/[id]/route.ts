import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createServiceSupabase } from "@/lib/supabase/server";
import { deleteImage } from "@/lib/cloudinary";
import { z } from "zod";

const pricingTierSchema = z.object({
  months: z.number().int().positive(),
  price: z.number().positive(),
});

const schema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  pricingTiers: z.array(pricingTierSchema).min(1).nullable().optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  pinnedImageUrl: z.string().url().nullable().optional(),
  pinnedImagePublicId: z.string().nullable().optional(),
  inStock: z.boolean().optional(),
  isVisible: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = { ...parsed.data };

  if (data.pricingTiers && data.pricingTiers.length > 0) {
    data.price = Math.min(...data.pricingTiers.map((t) => t.price));
  }

  // Map camelCase to snake_case for Supabase
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.pricingTiers !== undefined) updateData.pricing_tiers = data.pricingTiers;
  if (data.instructions !== undefined) updateData.instructions = data.instructions;
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
  if (data.imagePublicId !== undefined) updateData.image_public_id = data.imagePublicId;
  if (data.pinnedImageUrl !== undefined) updateData.pinned_image_url = data.pinnedImageUrl;
  if (data.pinnedImagePublicId !== undefined) updateData.pinned_image_public_id = data.pinnedImagePublicId;
  if (data.inStock !== undefined) updateData.in_stock = data.inStock;
  if (data.isVisible !== undefined) updateData.is_visible = data.isVisible;

  const supabase = await createServiceSupabase();
  const { data: product, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(product);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createServiceSupabase();

  const { data: product } = await supabase
    .from("products")
    .select("image_public_id")
    .eq("id", id)
    .single();

  if (product?.image_public_id) {
    await deleteImage(product.image_public_id);
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
