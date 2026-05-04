function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'text-lg',
  className = '',
}) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars.map((star) => {
        const isActive = star <= value
        const starClass = `${size} ${isActive ? 'text-amber-500' : 'text-slate-300'}`

        if (readOnly) {
          return (
            <span key={star} aria-hidden="true" className={starClass}>
              ★
            </span>
          )
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="transition-transform duration-200 hover:scale-110"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <span className={starClass}>★</span>
          </button>
        )
      })}
      {!readOnly && (
        <span className="ml-2 text-sm font-semibold text-slate-700">{value || 0}/5</span>
      )}
    </div>
  )
}

export default StarRating
