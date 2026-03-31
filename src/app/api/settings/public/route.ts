import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServiceSupabase();

  const { data: settings } = await supabase
    .from("settings")
    .select("whatsapp_number, telegram_username")
    .limit(1)
    .single();

  return NextResponse.json({
    whatsappNumber: settings?.whatsapp_number || "",
    telegramUsername: settings?.telegram_username || "",
  });
}
