"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  isVisible: boolean;
}

export default function AdminProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();

  async function toggleStock(id: string, inStock: boolean) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !inStock }),
    });
    router.refresh();
  }

  async function toggleVisibility(id: string, isVisible: boolean) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !isVisible }),
    });
    router.refresh();
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>No products yet.</p>
        <Link href="/admin/products/new" className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block text-sm">
          Add your first product
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card Grid */}
      <div className="flex flex-wrap gap-3 md:hidden">
        {products.map((p) => (
          <div key={p.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden min-w-[140px] flex-1 max-w-[220px]">
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              {!p.isVisible && (
                <div className="absolute top-1.5 left-1.5">
                  <span className="bg-slate-800/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">Hidden</span>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate">{p.name}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-0.5">{formatPrice(p.price)}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  onClick={() => toggleStock(p.id, p.inStock)}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition ${
                    p.inStock ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {p.inStock ? "In Stock" : "Out of Stock"}
                </button>
                <button
                  onClick={() => toggleVisibility(p.id, p.isVisible)}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition ${
                    p.isVisible ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {p.isVisible ? "Visible" : "Hidden"}
                </button>
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Edit
                </Link>
                <button onClick={() => deleteProduct(p.id, p.name)} className="text-xs text-red-500 dark:text-red-400 hover:underline font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Product</th>
              <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Price</th>
              <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Stock</th>
              <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Visible</th>
              <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white truncate max-w-[200px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStock(p.id, p.inStock)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                      p.inStock ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleVisibility(p.id, p.isVisible)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                      p.isVisible ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300" : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {p.isVisible ? "Visible" : "Hidden"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteProduct(p.id, p.name)}
                      className="text-xs text-red-500 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
