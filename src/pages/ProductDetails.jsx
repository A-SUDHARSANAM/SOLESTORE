import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'
import { useWishlist } from '../context/WishlistContext'
import fallbackShoe from '../assets/fallback-shoe.svg'
import { formatCurrency } from '../lib/currency'

function ProductDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { getProductById, recordRecentlyViewed } = useProducts()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const product = getProductById(id)

  useEffect(() => {
    if (product) {
      recordRecentlyViewed(product.id)
    }
  }, [product, recordRecentlyViewed])

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

  const gallery = product.images?.length ? product.images : [product.image]
  const wishlisted = isWishlisted(product.id)
  const fallbackImage = fallbackShoe

  const originalPrice = product.originalPrice || Math.round(product.price * 1.25)
  const discount = product.discount || 20

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

  return (
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
            This product uses static frontend data. Cart, wishlist, checkout, and order status are saved in your browser.
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
  )
}

export default ProductDetails
