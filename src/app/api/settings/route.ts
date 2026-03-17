import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  sitePassword: z.string().min(4),
  whatsappNumber: z.string().min(5),
  telegramUsername: z.string().min(3),
  siteName: z.string().min(1),
  siteDescription: z.string(),
});

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

  const existing = await prisma.settings.findFirst();

  const settings = existing
    ? await prisma.settings.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.settings.create({ data: parsed.data });

  return NextResponse.json(settings);
}

const patchSchema = z.object({
  productsSold: z.number().int().min(0),
});

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.settings.findFirst();
  if (!existing) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  }

  const settings = await prisma.settings.update({
    where: { id: existing.id },
    data: { productsSold: parsed.data.productsSold },
  });

  return NextResponse.json(settings);
}
