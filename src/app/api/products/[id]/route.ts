import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = { ...parsed.data };

  // Auto-compute price from tiers if tiers are being updated
  if (data.pricingTiers && data.pricingTiers.length > 0) {
    data.price = Math.min(...data.pricingTiers.map((t) => t.price));
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  return NextResponse.json(product);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (product?.imagePublicId) {
    await deleteImage(product.imagePublicId);
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
