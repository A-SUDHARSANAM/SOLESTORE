import { FiCheck } from 'react-icons/fi'
import StarRating from './StarRating'

function ReviewCard({ review }) {
  const isVerified = review?.verified !== false

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{review.user}</p>
          <p className="text-xs font-medium text-slate-500">{review.date}</p>
        </div>
        {isVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            <FiCheck className="h-3.5 w-3.5" />
            Verified Purchase
          </span>
        )}
      </div>
      <div className="mt-3">
        <StarRating value={review.rating} readOnly size="text-sm" />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
    </div>
  )
}

export default ReviewCard
