import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

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
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
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

  // Get existing product names to skip duplicates
  const existing = await prisma.product.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((p) => p.name.toLowerCase()));

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

    // Auto-compute price from tiers
    if (data.pricingTiers && data.pricingTiers.length > 0) {
      data.price = Math.min(...data.pricingTiers.map((t) => t.price));
    }

    await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price!,
        pricingTiers: data.pricingTiers ?? undefined,
        instructions: data.instructions ?? undefined,
        imageUrl: data.imageUrl,
        pinnedImageUrl: data.pinnedImageUrl ?? undefined,
        inStock: data.inStock,
        isVisible: data.isVisible,
      },
    });

    existingNames.add(data.name.toLowerCase());
    imported++;
  }

  return NextResponse.json({ imported, skipped, errors });
}
