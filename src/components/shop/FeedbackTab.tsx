interface Review {
  id: string;
  rating: number;
  comment: string;
  user: { username: string };
  product: { name: string };
  createdAt: string;
}

interface Props {
  reviews: Review[];
}

export default function FeedbackTab({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-lg">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 sm:text-left text-center">
        Customer Feedback
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-white">
                  {review.user.username}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  on {review.product.name}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm tracking-tight">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= review.rating
                          ? "text-yellow-400"
                          : "text-slate-300 dark:text-slate-600"
                      }
                    >
                      ★
                    </span>
                  ))}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
