import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProductsSoldCounter from "@/components/admin/ProductsSoldCounter";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const [productCount, pendingReviews, userCount, settings] = await Promise.all([
    prisma.product.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.settings.findFirst(),
  ]);

  const stats = [
    { label: "Total Products", value: productCount, href: "/admin/products", color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
    { label: "Pending Reviews", value: pendingReviews, href: "/admin/reviews", color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
    { label: "Registered Users", value: userCount, href: "#", color: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Admin Dashboard</Link>
        <Link href="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Back to Shop
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className={`rounded-xl p-6 ${stat.color} hover:opacity-80 transition`}>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm font-medium mt-1">{stat.label}</p>
              </div>
            </Link>
          ))}
          <ProductsSoldCounter initialCount={settings?.productsSold ?? 0} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: "/admin/products", label: "Manage Products", desc: "Add, edit, or remove products" },
            { href: "/admin/reviews", label: "Moderate Reviews", desc: "Approve or reject customer reviews" },
            { href: "/admin/settings", label: "Site Settings", desc: "Update password, contact links" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition">
                <h3 className="font-semibold text-slate-800 dark:text-white">{item.label}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
