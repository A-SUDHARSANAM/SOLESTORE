import { useEffect, useState } from 'react'
import { FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi'
import { deleteReview, subscribeToReviews, updateReview } from '../../services/reviewService'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    return subscribeToReviews(setReviews, () => setReviews([]))
  }, [])

  const toggleVisibility = async (review) => {
    await updateReview(review.id, { visible: !review.visible })
  }

  const handleDelete = async (reviewId) => {
    await deleteReview(reviewId)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quality</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Reviews</h1>
        <p className="mt-2 text-sm text-slate-600">Moderate customer feedback and hide spam.</p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{review.user}</p>
                <p className="text-xs text-slate-500">Product: {review.productId}</p>
                <p className="mt-3 text-sm text-slate-700">{review.comment}</p>
                <p className="mt-2 text-xs text-slate-500">Rating: {review.rating}/5</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleVisibility(review)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {review.visible === false ? <FiEye className="h-3.5 w-3.5" /> : <FiEyeOff className="h-3.5 w-3.5" />}
                  {review.visible === false ? 'Show' : 'Hide'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(review.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}

        {reviews.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No reviews yet.
          </div>
        )}
      </div>
    </div>
  )
}
