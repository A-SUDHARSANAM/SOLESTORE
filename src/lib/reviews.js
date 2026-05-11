import { isFirebaseConfigured } from '../firebase'
import { addReview } from '../services/reviewService'

const REVIEWS_STORAGE_KEY = 'sole-reviews-v1'

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback
  } catch {
    return fallback
  }
}

export { REVIEWS_STORAGE_KEY }

export function getReviews() {
  return safeParse(localStorage.getItem(REVIEWS_STORAGE_KEY), {})
}

export function getReviewsForProduct(productId) {
  if (productId === undefined || productId === null) return []
  const allReviews = getReviews()
  return allReviews[String(productId)] ?? []
}

export function saveReview(productId, review) {
  if (productId === undefined || productId === null) return null
  const key = String(productId)
  const allReviews = getReviews()
  const nextReviews = [...(allReviews[key] ?? []), review]
  const nextAllReviews = {
    ...allReviews,
    [key]: nextReviews,
  }

  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(nextAllReviews))

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('reviews:updated', { detail: { productId: key } }))
  }

  if (isFirebaseConfigured) {
    void addReview({
      productId: key,
      user: review.user,
      rating: Number(review.rating || 0),
      comment: review.comment,
      date: review.date,
      verified: review.verified !== false,
      visible: true,
    }).catch(() => {})
  }

  return review
}

export function getAverageRating(productId) {
  const reviews = getReviewsForProduct(productId)
  if (!reviews.length) return null
  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)
  return Number((total / reviews.length).toFixed(1))
}

export function hasUserReviewed(productId, user = 'Guest') {
  return getReviewsForProduct(productId).some((review) => review.user === user)
}

export function getReviewCount(productId) {
  return getReviewsForProduct(productId).length
}
