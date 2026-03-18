"use client";

import { useState, useEffect } from "react";

interface Props {
  whatsappNumber?: string;
}

export default function WelcomeModal({ whatsappNumber }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem("aio-visited");
    if (!visited) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("aio-visited", "1");
    setShow(false);
  };

  if (!show) return null;

  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I came from AIO Shop and I'm interested in your products.")}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center border border-slate-200 dark:border-slate-700 animate-in">
        <div className="text-4xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Welcome to AIO Shop
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-1">
          Your All-in-One destination.
        </p>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Find everything you need, all in one place. Browse our products or reach out anytime.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Browse Products
          </button>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .611.611l4.458-1.495A11.96 11.96 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.347 0-4.518-.802-6.237-2.148l-.436-.35-3.246 1.088 1.088-3.246-.35-.436A9.95 9.95 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
              Chat on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
