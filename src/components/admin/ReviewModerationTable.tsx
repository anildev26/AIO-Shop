"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: Date;
  user: { username: string };
  product: { name: string };
}

export default function ReviewModerationTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setLoading(id);
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    setLoading(id);
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  if (reviews.length === 0) {
    return <p className="text-slate-400">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-slate-700 dark:text-slate-200">@{review.user.username}</span>
                <span className="text-slate-400 text-sm">on</span>
                <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">{review.product.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  review.status === "APPROVED" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : review.status === "REJECTED" ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                }`}>
                  {review.status}
                </span>
              </div>
              <div className="text-yellow-400 mt-1 text-sm">
                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{review.comment}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {review.status !== "APPROVED" && (
                <button
                  onClick={() => updateStatus(review.id, "APPROVED")}
                  disabled={loading === review.id}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  Approve
                </button>
              )}
              {review.status !== "REJECTED" && (
                <button
                  onClick={() => updateStatus(review.id, "REJECTED")}
                  disabled={loading === review.id}
                  className="text-xs bg-slate-500 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              <button
                onClick={() => deleteReview(review.id)}
                disabled={loading === review.id}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
