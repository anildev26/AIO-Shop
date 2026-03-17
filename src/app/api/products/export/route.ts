import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const exportData = products.map((p) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    pricingTiers: p.pricingTiers,
    instructions: p.instructions,
    imageUrl: p.imageUrl,
    pinnedImageUrl: p.pinnedImageUrl,
    inStock: p.inStock,
    isVisible: p.isVisible,
  }));

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="aio-shop-products.json"',
    },
  });
}
