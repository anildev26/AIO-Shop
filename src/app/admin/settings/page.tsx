import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const settings = await prisma.settings.findFirst();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Site Settings</Link>
        <Link href="/admin" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Admin</Link>
      </nav>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <SettingsForm settings={settings} />
      </main>
    </div>
  );
}
