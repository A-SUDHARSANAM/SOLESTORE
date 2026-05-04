import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useProductReviews } from '../hooks/useProductReviews'
import fallbackShoe from '../assets/fallback-shoe.svg'
import { formatCurrency } from '../lib/currency'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(product.id)
  const { averageRating, reviewCount } = useProductReviews(product.id)

  const originalPrice = product.originalPrice || Math.round(product.price * 1.25)
  const discount = product.discount || 20
  const rating = reviewCount ? averageRating : product.rating || 4.5
  const stock = product.stock ?? 10
  const isOutOfStock = stock === 0
  const isLowStock = stock > 0 && stock <= 5
  const fallbackImage = fallbackShoe

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addToCart(product)
    toast.success('Added to cart successfully', { id: `cart-${product.id}` })
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  const handleImageError = (event) => {
    if (event.currentTarget.dataset.fallbackApplied === 'true') return
    event.currentTarget.dataset.fallbackApplied = 'true'
    event.currentTarget.src = fallbackImage
    event.currentTarget.srcset = ''
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group ui-card-lift relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg shadow-slate-900/10"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-md bg-gray-900 px-4 py-2 text-sm font-bold tracking-wider text-white shadow-lg">
              OUT OF STOCK
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute right-3 top-3 z-30 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${
            wishlisted
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-400 hover:text-red-500'
          }`}
        >
          {wishlisted ? '♥' : '♡'}
        </button>

        <motion.img
          src={product.image || fallbackImage}
          alt={product.name}
          className={`ui-image-zoom h-full w-full object-cover ${isOutOfStock ? 'opacity-50' : ''}`}
          loading="lazy"
          onError={handleImageError}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Quick Add to Cart (Hover) */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 z-30 translate-y-full p-3 transition-transform duration-300 ease-out group-hover:translate-y-0">
            <button
              type="button"
              onClick={handleAddToCart}
              className="ui-button-primary w-full rounded-xl bg-slate-900/95 px-4 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-sm"
            >
              Quick Add to Cart
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {product.brand}
            </p>
            <h3 className="mt-1.5 font-display text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-1">
            <span className="text-xs font-bold text-green-700">{rating}</span>
            <span className="text-[10px] text-green-600">★</span>
          </div>
        </div>

        <p className="mt-1 text-sm font-medium text-gray-500">{product.category}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-gray-900">{formatCurrency(product.price)}</span>
                <span className="text-sm font-medium text-gray-400 line-through">{formatCurrency(originalPrice)}</span>
              </div>
              <span className="mt-0.5 inline-block text-xs font-bold text-green-600">{discount}% off</span>
            </div>
            
            {isLowStock && (
              <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
                Only {stock} left
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
