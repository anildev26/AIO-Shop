import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

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
  const products = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = { ...parsed.data };

  // Auto-compute price from tiers if tiers are provided
  if (data.pricingTiers && data.pricingTiers.length > 0) {
    data.price = Math.min(...data.pricingTiers.map((t) => t.price));
  }

  const product = await prisma.product.create({ data: { ...data, price: data.price! } });
  return NextResponse.json(product, { status: 201 });
}
