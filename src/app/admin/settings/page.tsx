import { createServiceSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");

  const supabase = await createServiceSupabase();
  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .single();

  // Map snake_case to camelCase for SettingsForm
  const mappedSettings = settings ? {
    id: settings.id,
    sitePassword: settings.site_password,
    whatsappNumber: settings.whatsapp_number,
    telegramUsername: settings.telegram_username,
    siteName: settings.site_name,
    siteDescription: settings.site_description,
    productsSold: settings.products_sold,
  } : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Site Settings</Link>
        <Link href="/admin" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Admin</Link>
      </nav>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <SettingsForm settings={mappedSettings} />
      </main>
    </div>
  );
}
