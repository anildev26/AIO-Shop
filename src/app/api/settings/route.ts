import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createServiceSupabase } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  sitePassword: z.string().min(4),
  whatsappNumber: z.string().min(5),
  telegramUsername: z.string().min(3),
  siteName: z.string().min(1),
  siteDescription: z.string(),
});

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

  const supabase = await createServiceSupabase();
  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .limit(1)
    .single();

  const updateData = {
    site_password: parsed.data.sitePassword,
    whatsapp_number: parsed.data.whatsappNumber,
    telegram_username: parsed.data.telegramUsername,
    site_name: parsed.data.siteName,
    site_description: parsed.data.siteDescription,
  };

  let settings;
  if (existing) {
    const { data, error } = await supabase
      .from("settings")
      .update(updateData)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    settings = data;
  } else {
    const { data, error } = await supabase
      .from("settings")
      .insert(updateData)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    settings = data;
  }

  return NextResponse.json(settings);
}

const patchSchema = z.object({
  productsSold: z.number().int().min(0),
});

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = await createServiceSupabase();
  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .limit(1)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  }

  const { data: settings, error } = await supabase
    .from("settings")
    .update({ products_sold: parsed.data.productsSold })
    .eq("id", existing.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(settings);
}
