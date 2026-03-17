"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PricingTier } from "@/lib/utils";

interface Props {
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    pricingTiers?: PricingTier[] | null;
    instructions?: string | null;
    imageUrl: string;
    pinnedImageUrl?: string | null;
    pinnedImagePublicId?: string | null;
    inStock: boolean;
    isVisible: boolean;
  };
}

export default function ProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const existingTiers = product?.pricingTiers as PricingTier[] | null;
  const hasTiersInitially = !!(existingTiers && existingTiers.length > 0);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    instructions: product?.instructions ?? "",
    inStock: product?.inStock ?? true,
    isVisible: product?.isVisible ?? true,
  });
  const [hasTiers, setHasTiers] = useState(hasTiersInitially);
  const [tiers, setTiers] = useState<{ months: string; price: string }[]>(
    hasTiersInitially
      ? existingTiers!.map((t) => ({ months: t.months.toString(), price: t.price.toString() }))
      : [{ months: "", price: "" }]
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl ?? "");
  const [pinnedImageFile, setPinnedImageFile] = useState<File | null>(null);
  const [pinnedImagePreview, setPinnedImagePreview] = useState(product?.pinnedImageUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleTierChange(index: number, field: "months" | "price", value: string) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addTier() {
    setTiers((prev) => [...prev, { months: "", price: "" }]);
  }

  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handlePinnedImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPinnedImageFile(file);
    setPinnedImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let imageUrl = product?.imageUrl ?? "";
    let imagePublicId = "";

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        setError("Image upload failed.");
        setLoading(false);
        return;
      }
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
      imagePublicId = uploadData.publicId;
    }

    if (!imageUrl) {
      setError("Please upload a product image.");
      setLoading(false);
      return;
    }

    // Upload pinned image if selected
    let pinnedImageUrl = product?.pinnedImageUrl ?? "";
    let pinnedImagePublicId = product?.pinnedImagePublicId ?? "";

    if (pinnedImageFile) {
      const pinnedFormData = new FormData();
      pinnedFormData.append("file", pinnedImageFile);
      const pinnedUploadRes = await fetch("/api/upload", { method: "POST", body: pinnedFormData });
      if (!pinnedUploadRes.ok) {
        setError("Pinned image upload failed.");
        setLoading(false);
        return;
      }
      const pinnedUploadData = await pinnedUploadRes.json();
      pinnedImageUrl = pinnedUploadData.url;
      pinnedImagePublicId = pinnedUploadData.publicId;
    }

    // Build payload
    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      instructions: form.instructions,
      imageUrl,
      imagePublicId,
      pinnedImageUrl: pinnedImageUrl || null,
      pinnedImagePublicId: pinnedImagePublicId || null,
      inStock: form.inStock,
      isVisible: form.isVisible,
    };

    if (hasTiers) {
      const parsedTiers = tiers
        .filter((t) => t.months && t.price)
        .map((t) => ({ months: parseInt(t.months), price: parseFloat(t.price) }));

      if (parsedTiers.length === 0) {
        setError("Add at least one pricing tier.");
        setLoading(false);
        return;
      }

      payload.pricingTiers = parsedTiers;
      payload.price = Math.min(...parsedTiers.map((t) => t.price));
    } else {
      payload.price = parseFloat(form.price);
      payload.pricingTiers = null;
    }

    const url = isEdit ? `/api/products/${product.id}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
    }

    setLoading(false);
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
        <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} required className={`${inputClass} resize-none`} />
      </div>

      {/* Pricing toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={hasTiers}
            onChange={(e) => setHasTiers(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Has subscription pricing tiers</span>
        </label>

        {!hasTiers ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (INR) *</label>
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className={inputClass} />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">Add pricing for each subscription duration:</p>
            {tiers.map((tier, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    placeholder="Months"
                    value={tier.months}
                    onChange={(e) => handleTierChange(i, "months", e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Price (INR)"
                    value={tier.price}
                    onChange={(e) => handleTierChange(i, "price", e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  disabled={tiers.length <= 1}
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove tier"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTier}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              + Add Tier
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
        <textarea name="instructions" value={form.instructions} onChange={handleChange} rows={4} placeholder="Usage instructions, delivery details, etc." className={`${inputClass} resize-none`} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Product Image *</label>
        {imagePreview && (
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-3">
            <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-slate-600 dark:text-slate-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pinned Review Image</label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">This image will be pinned at the top of the reviews section for all users to see.</p>
        {pinnedImagePreview && (
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-3">
            <img src={pinnedImagePreview} alt="Pinned preview" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => { setPinnedImagePreview(""); setPinnedImageFile(null); }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              title="Remove pinned image"
            >
              &times;
            </button>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handlePinnedImageChange} className="text-sm text-slate-600 dark:text-slate-400" />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} className="w-4 h-4 rounded" />
          <span className="text-sm text-slate-700 dark:text-slate-300">In Stock</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isVisible" checked={form.isVisible} onChange={handleChange} className="w-4 h-4 rounded" />
          <span className="text-sm text-slate-700 dark:text-slate-300">Visible to users</span>
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}
