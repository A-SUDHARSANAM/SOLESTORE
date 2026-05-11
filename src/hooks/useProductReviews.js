import { useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured, db } from '../firebase'
import { REVIEWS_STORAGE_KEY, getReviewsForProduct } from '../lib/reviews'
import { subscribeToReviewsByProduct } from '../services/reviewService'

export function useProductReviews(productId) {
  const [reviews, setReviews] = useState(() => getReviewsForProduct(productId))

  useEffect(() => {
    if (!productId) {
      setReviews([])
      return undefined
    }

    let unsubscribeFirebase = () => {}

    if (isFirebaseConfigured && db) {
      unsubscribeFirebase = subscribeToReviewsByProduct(
        productId,
        (docs) => {
          const nextReviews = docs
            .filter((review) => review.visible !== false)
            .map((review) => ({
              user: review.user,
              rating: Number(review.rating || 0),
              comment: review.comment,
              date: review.date,
              verified: review.verified !== false,
            }))
          setReviews(nextReviews)
        },
        (err) => {
          console.error('[useProductReviews] Firestore error:', err)
          setReviews(getReviewsForProduct(productId))
        },
      )
    }

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

    if (typeof window !== 'undefined') {
      window.addEventListener('reviews:updated', handleUpdate)
      window.addEventListener('storage', handleStorage)
    }

    return () => {
      unsubscribeFirebase()
      if (typeof window !== 'undefined') {
        window.removeEventListener('reviews:updated', handleUpdate)
        window.removeEventListener('storage', handleStorage)
      }
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
