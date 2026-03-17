"use client";

import { useState } from "react";

interface Settings {
  sitePassword: string;
  whatsappNumber: string;
  telegramUsername: string;
  siteName: string;
  siteDescription: string;
}

export default function SettingsForm({ settings }: { settings: Settings | null }) {
  const [form, setForm] = useState({
    sitePassword: settings?.sitePassword ?? "",
    whatsappNumber: settings?.whatsappNumber ?? "",
    telegramUsername: settings?.telegramUsername ?? "",
    siteName: settings?.siteName ?? "AIO Shop",
    siteDescription: settings?.siteDescription ?? "Private Product Catalog",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save settings.");
    }
    setLoading(false);
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Name</label>
        <input name="siteName" value={form.siteName} onChange={handleChange} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Description</label>
        <input name="siteDescription" value={form.siteDescription} onChange={handleChange} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Password (gate)</label>
        <input name="sitePassword" type="text" value={form.sitePassword} onChange={handleChange} required className={inputClass} />
        <p className="text-xs text-slate-400 mt-1">Visitors must enter this to access the login page.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
        <input name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} placeholder="91XXXXXXXXXX" required className={inputClass} />
        <p className="text-xs text-slate-400 mt-1">Include country code, no spaces or dashes (e.g. 919876543210)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telegram Username</label>
        <input name="telegramUsername" value={form.telegramUsername} onChange={handleChange} placeholder="yourusername" required className={inputClass} />
        <p className="text-xs text-slate-400 mt-1">Without the @ symbol</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {saved && <p className="text-green-600 text-sm">Settings saved successfully!</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
