import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import ReviewCard from '../components/ReviewCard'
import StarRating from '../components/StarRating'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'
import { useWishlist } from '../context/WishlistContext'
import { useProductReviews } from '../hooks/useProductReviews'
import fallbackShoe from '../assets/fallback-shoe.svg'
import { formatCurrency } from '../lib/currency'
import { getOrders } from '../lib/orders'
import { saveReview } from '../lib/reviews'

function ProductDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { getProductById, productsLoading, recordRecentlyViewed } = useProducts()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const product = getProductById(id)
  const { reviews, reviewCount, averageRating, hasReviewed } = useProductReviews(id)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState('')
  const orders = useMemo(() => getOrders(), [])
  const hasPurchased = useMemo(
    () =>
      orders.some((order) =>
        order.items?.some(
          (item) =>
            String(item.productId ?? item.id) === String(product?.id),
        ),
      ),
    [orders, product?.id],
  )

  useEffect(() => {
    if (product) {
      recordRecentlyViewed(product.id)
    }
  }, [product, recordRecentlyViewed])

  if (productsLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-slate-200 border-t-slate-900" />
        <p className="mt-4 text-sm font-semibold text-slate-600">Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-sm font-medium text-slate-700 underline">
          Back to Shop
        </Link>
      </div>
    )
  }

  const gallery = product.images?.length ? product.images : [product.imageUrl || product.image]
  const wishlisted = isWishlisted(product.id)
  const fallbackImage = fallbackShoe

  const originalPrice = product.originalPrice || Math.round(product.price * 1.25)
  const discount = product.discount || 20
  const canWriteReview = hasPurchased && !hasReviewed
  const reviewSummaryLabel = reviewCount
    ? `${averageRating} ★ (${reviewCount} review${reviewCount > 1 ? 's' : ''})`
    : 'No reviews yet'

  const handleAddToCart = () => {
    addToCart(product)
    toast.success('Added to cart successfully', { id: `cart-${product.id}` })
  }

  const handleImageError = (event) => {
    if (event.currentTarget.dataset.fallbackApplied === 'true') return
    event.currentTarget.dataset.fallbackApplied = 'true'
    event.currentTarget.src = fallbackImage
    event.currentTarget.srcset = ''
  }

  const handleOpenReview = () => {
    if (!hasPurchased) {
      toast.error('You can review only purchased products')
      return
    }
    if (hasReviewed) {
      toast.error('You have already reviewed this product')
      return
    }

    setIsReviewOpen(true)
  }

  const handleSubmitReview = (event) => {
    event.preventDefault()
    setFormError('')

    if (!selectedRating || !comment.trim()) {
      setFormError('Please provide a rating and a comment.')
      return
    }

    saveReview(product.id, {
      user: 'Guest',
      rating: selectedRating,
      comment: comment.trim(),
      date: new Date().toISOString().slice(0, 10),
      verified: true,
    })

    toast.success('Review submitted successfully')
    setSelectedRating(0)
    setComment('')
    setIsReviewOpen(false)
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-premium md:grid-cols-[1.05fr_1fr] md:p-8">
        <div className="space-y-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={gallery[0] || fallbackImage}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={handleImageError}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {gallery.slice(0, 2).map((image, index) => (
              <img
                key={`${product.id}-${index}`}
                src={image || fallbackImage}
                alt={`${product.name} view ${index + 1}`}
                className="aspect-[4/3] w-full rounded-xl object-cover"
                loading="lazy"
                onError={handleImageError}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Link to="/" className="transition hover:text-ink">Home</Link>
              <span>&gt;</span>
              <Link to="/shop" className="transition hover:text-ink">Shop</Link>
              <span>&gt;</span>
              <span className="text-ink">{product.name}</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{product.brand}</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-base text-slate-600">{product.category}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {reviewCount > 0 ? (
                <>
                  <StarRating value={averageRating} readOnly size="text-sm" />
                  <span className="text-sm font-semibold text-slate-700">{reviewSummaryLabel}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-slate-500">{reviewSummaryLabel}</span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-extrabold text-ink">{formatCurrency(product.price)}</span>
              <span className="text-xl font-semibold text-slate-400 line-through">{formatCurrency(originalPrice)}</span>
              <span className="text-lg font-bold text-green-600">({discount}% off)</span>
            </div>
          </div>

          <p className="leading-relaxed text-slate-600">{product.description}</p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Demo store note</p>
            <p className="mt-1 text-sm text-slate-600">
              Product details sync from Firestore in real time. Cart, wishlist, checkout, and order status are still saved in your browser.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-100"
            >
              {wishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
            </button>
            <Link to="/shop" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-100">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-premium sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600">Customer Reviews</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Ratings & feedback</h2>
            <p className="mt-2 text-sm text-slate-600">{reviewSummaryLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleOpenReview}
            aria-disabled={!canWriteReview}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              canWriteReview
                ? 'bg-slate-900 text-white hover:bg-black'
                : 'cursor-not-allowed bg-slate-200 text-slate-500'
            }`}
          >
            Write a Review
          </button>
        </div>

        {!hasPurchased && (
          <p className="mt-3 text-sm font-medium text-slate-500">You can review only purchased products.</p>
        )}
        {hasReviewed && (
          <p className="mt-3 text-sm font-medium text-emerald-600">You have already reviewed this product.</p>
        )}

        {isReviewOpen && !hasReviewed && (
          <form onSubmit={handleSubmitReview} className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Your rating</p>
            <StarRating value={selectedRating} onChange={setSelectedRating} className="mt-3" />
            <label className="mt-5 block text-sm font-semibold text-slate-900" htmlFor="review-comment">
              Your review
            </label>
            <textarea
              id="review-comment"
              rows="4"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share how the fit, comfort, and style felt."
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            />

            {formError && (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {formError}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 space-y-4">
          {reviewCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
              No reviews yet. Be the first to review!
            </div>
          ) : (
            reviews.map((review, index) => (
              <ReviewCard key={`${review.user}-${review.date}-${index}`} review={review} />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default ProductDetails
