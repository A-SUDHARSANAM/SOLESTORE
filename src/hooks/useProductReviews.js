import { useEffect, useMemo, useState } from 'react'
import { REVIEWS_STORAGE_KEY, getReviewsForProduct } from '../lib/reviews'

export function useProductReviews(productId) {
  const [reviews, setReviews] = useState(() => getReviewsForProduct(productId))

  useEffect(() => {
    setReviews(getReviewsForProduct(productId))
  }, [productId])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleUpdate = (event) => {
      if (!event?.detail?.productId || String(event.detail.productId) === String(productId)) {
        setReviews(getReviewsForProduct(productId))
      }
    }

    const handleStorage = (event) => {
      if (event.key === REVIEWS_STORAGE_KEY) {
        setReviews(getReviewsForProduct(productId))
      }
    }

    window.addEventListener('reviews:updated', handleUpdate)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('reviews:updated', handleUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [productId])

  const reviewCount = reviews.length
  const averageRating = useMemo(() => {
    if (!reviewCount) return null
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)
    return Number((total / reviewCount).toFixed(1))
  }, [reviewCount, reviews])

  const hasReviewed = useMemo(
    () => reviews.some((review) => review.user === 'Guest'),
    [reviews],
  )

  return {
    reviews,
    reviewCount,
    averageRating,
    hasReviewed,
  }
}
