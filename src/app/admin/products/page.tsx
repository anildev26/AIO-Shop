import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminProductsTable from "@/components/admin/AdminProductsTable";
import ProductActions from "@/components/admin/ProductActions";

export default async function AdminProductsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Manage Products</Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ProductActions mode="inline" />
          </div>
          <Link href="/admin" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">&larr; Admin</Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <AdminProductsTable products={products} />
      </main>
      <div className="md:hidden">
        <ProductActions mode="fab" />
      </div>
    </div>
  );
}
