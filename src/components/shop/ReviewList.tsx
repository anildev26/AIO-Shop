interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { username: string };
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-slate-400 text-sm">No approved reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-200">@{review.user.username}</span>
            <span className="text-sm text-slate-400">
              {new Date(review.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>
          <div className="text-yellow-400 mb-2">
            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
