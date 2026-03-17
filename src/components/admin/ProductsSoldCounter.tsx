"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsSoldCounter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function updateCount(newCount: number) {
    if (newCount < 0) return;
    setCount(newCount);
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productsSold: newCount }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-xl p-6">
      <p className="text-sm font-medium mb-2">Products Sold</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateCount(count - 1)}
          disabled={saving || count <= 0}
          className="w-8 h-8 rounded-lg bg-purple-200 dark:bg-purple-800 hover:bg-purple-300 dark:hover:bg-purple-700 flex items-center justify-center font-bold text-lg transition disabled:opacity-40"
        >
          -
        </button>
        <input
          type="number"
          min="0"
          value={count}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 0) setCount(val);
          }}
          onBlur={() => updateCount(count)}
          className="w-20 text-center text-2xl font-bold bg-transparent border-b-2 border-purple-300 dark:border-purple-600 focus:outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={() => updateCount(count + 1)}
          disabled={saving}
          className="w-8 h-8 rounded-lg bg-purple-200 dark:bg-purple-800 hover:bg-purple-300 dark:hover:bg-purple-700 flex items-center justify-center font-bold text-lg transition disabled:opacity-40"
        >
          +
        </button>
      </div>
      {saving && <p className="text-xs mt-1 opacity-60">Saving...</p>}
    </div>
  );
}
