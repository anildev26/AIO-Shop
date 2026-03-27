import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const supabase = await createServiceSupabase();
  const { data: settings } = await supabase
    .from("settings")
    .select("site_password")
    .limit(1)
    .single();

  if (!settings || password !== settings.site_password) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("site_gate", process.env.SITE_PASSWORD_HASH!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
