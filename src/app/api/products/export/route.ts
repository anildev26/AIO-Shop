import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createServiceSupabase();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const exportData = products.map((p) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    pricingTiers: p.pricing_tiers,
    instructions: p.instructions,
    imageUrl: p.image_url,
    pinnedImageUrl: p.pinned_image_url,
    inStock: p.in_stock,
    isVisible: p.is_visible,
  }));

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="aio-shop-products.json"',
    },
  });
}
