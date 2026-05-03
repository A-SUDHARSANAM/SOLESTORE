import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'
import { useWishlist } from '../context/WishlistContext'
import { toast } from 'react-hot-toast'

export default function Wishlist() {
  const { wishlistIds, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { products } = useProducts()
  const wishlistProducts = products.filter((product) => wishlistIds.includes(product.id))

  const handleMoveToCart = (product) => {
    const added = addToCart(product, null, null, { silent: true })

    if (!added) {
      toast.error('Could not move item to cart')
      return
    }

    removeFromWishlist(product.id)
    toast.success(`${product.name} moved to cart`)
  }

  const handleRemoveFromWishlist = (product) => {
    removeFromWishlist(product.id)
    toast.success(`${product.name} removed from wishlist`)
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 shadow-sm sm:px-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Wishlist</h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 sm:text-base">
              Your wishlist is empty. Save a few pairs for later.
            </p>
            <Link to="/shop" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
            Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Wishlist</h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              You have {wishlistProducts.length} item(s) in your wishlist.
            </p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
            Continue shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="relative flex h-full flex-col gap-3">
              <button
                type="button"
                onClick={() => handleRemoveFromWishlist(product)}
                aria-label={`Remove ${product.name} from wishlist`}
                className="absolute left-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-sm backdrop-blur-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => handleMoveToCart(product)}
                className="mt-auto w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Move to Cart
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/shop" className="inline-flex font-semibold text-blue-600 transition hover:text-blue-700">
            Back to shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
