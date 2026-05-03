import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import fallbackShoe from '../assets/fallback-shoe.svg'
import { formatCurrency } from '../lib/currency'

const DELIVERY_FEE = 50
const FREE_DELIVERY_THRESHOLD = 2000
const COUPONS = {
  SHOE10: { type: 'percentage', value: 10 },
}

function getEstimatedDeliveryDate(daysFromNow = 5) {
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + daysFromNow)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(deliveryDate)
}

function getDeliveryNote(item) {
  const estimatedDate = getEstimatedDeliveryDate()

  if (item.price >= FREE_DELIVERY_THRESHOLD) {
    return `Free delivery by ${estimatedDate}`
  }

  return `${formatCurrency(DELIVERY_FEE)} delivery fee · Arrives by ${estimatedDate}`
}

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart()
  const { addToWishlist } = useWishlist()
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const fallbackImage = fallbackShoe

  const handleDecreaseQuantity = (item) => {
    if (item.quantity <= 1) return
    updateQuantity(item.id, item.size, item.quantity - 1)
  }

  const handleIncreaseQuantity = (item) => {
    updateQuantity(item.id, item.size, item.quantity + 1)
  }

  const handleMoveToWishlist = (item) => {
    addToWishlist(item.id)
    removeFromCart(item.id, item.size)
  }

  const handleImageError = (event) => {
    if (event.currentTarget.dataset.fallbackApplied === 'true') return
    event.currentTarget.dataset.fallbackApplied = 'true'
    event.currentTarget.src = fallbackImage
    event.currentTarget.srcset = ''
  }

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    const coupon = COUPONS[code]

    if (!coupon) {
      setAppliedCoupon('')
      setCouponMessage('Invalid coupon code')
      return
    }

    setAppliedCoupon(code)
    setCouponMessage(`${code} applied successfully`)
  }

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0

    const coupon = COUPONS[appliedCoupon]
    if (!coupon) return 0

    if (coupon.type === 'percentage') {
      return (totalPrice * coupon.value) / 100
    }

    return coupon.value
  }, [appliedCoupon, totalPrice])

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-8 sm:py-12">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-900/10 sm:p-10">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 shadow-xl shadow-slate-900/20">
              <svg viewBox="0 0 120 120" className="h-14 w-14 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 72c8-12 18-18 34-18s26 6 30 18" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <path d="M24 70l8-24h54l10 24" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M32 46l10 0" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <path d="M46 46l10 0" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <path d="M60 46l10 0" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <circle cx="44" cy="84" r="5" fill="currentColor" opacity="0.9" />
                <circle cx="76" cy="84" r="5" fill="currentColor" opacity="0.9" />
              </svg>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your cart is empty</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
              Add a pair of shoes to start building your order. We’ll keep the checkout ready when you are.
            </p>

            <div className="mt-8 flex justify-center">
              <Link to="/shop" className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all duration-300 hover:scale-105 hover:bg-black hover:shadow-xl">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const deliveryFee = DELIVERY_FEE
  const deliveryCharge = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : deliveryFee
  const grandTotal = totalPrice + deliveryCharge - discountAmount
  const totalSavings = useMemo(() => {
    return discountAmount + (deliveryCharge === 0 ? deliveryFee : 0)
  }, [deliveryCharge, deliveryFee, discountAmount])
  const estimatedDelivery = 'Arrives in 4-6 business days'

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <h1 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">Shopping Cart</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.size ?? 'default'}`} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:gap-4">
                <img
                  src={item.image || fallbackImage}
                  alt={item.name}
                  className="h-44 w-full shrink-0 rounded-xl object-cover transition-transform duration-300 hover:scale-[1.03] sm:h-24 sm:w-24"
                  onError={handleImageError}
                />

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.brand}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  <p className="mt-1 text-xs text-gray-500">{getDeliveryNote(item)}</p>
                </div>

                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  <div className="inline-flex w-full items-center justify-between rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm sm:w-auto sm:justify-start">
                    <button
                      type="button"
                      onClick={() => handleDecreaseQuantity(item)}
                      disabled={item.quantity <= 1}
                      className="grid h-9 w-9 place-items-center rounded-full bg-white text-lg font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:scale-[1.05] hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
                      aria-label={`Decrease quantity for ${item.name}`}
                    >
                      -
                    </button>
                    <span
                      className="min-w-10 px-3 text-center text-sm font-bold text-slate-900"
                      aria-label={`Quantity for ${item.name}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncreaseQuantity(item)}
                      className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-lg font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.05] hover:bg-black hover:shadow-md"
                      aria-label={`Increase quantity for ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-center font-semibold sm:text-right">{formatCurrency(item.price * item.quantity)}</p>
                  <button
                    type="button"
                    onClick={() => handleMoveToWishlist(item)}
                    className="w-full rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-300 hover:scale-[1.03] hover:bg-slate-100 hover:text-slate-900 sm:w-auto sm:px-3 sm:py-1"
                  >
                    Move to Wishlist
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="w-full rounded-full px-3 py-2 text-sm font-medium text-red-600 transition-all duration-300 hover:scale-[1.03] hover:bg-red-50 hover:text-red-700 sm:w-auto sm:px-3 sm:py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
              <div className="sticky top-24 rounded-lg bg-white p-5 shadow-md sm:p-6">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

              <div className="mb-4 space-y-2 rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{deliveryCharge === 0 ? 'Free' : formatCurrency(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="text-right text-sm text-gray-500">{estimatedDelivery}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                You saved {formatCurrency(totalSavings)}
              </div>

              <div className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <label htmlFor="coupon-code" className="mb-2 block text-sm font-semibold text-gray-800">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon-code"
                    type="text"
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    placeholder="Enter coupon code"
                    className="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`mt-2 text-xs font-medium ${appliedCoupon ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {couponMessage}
                  </p>
                )}
                {appliedCoupon && (
                  <p className="mt-1 text-xs text-gray-500">
                    Applied coupon: <span className="font-semibold text-gray-700">{appliedCoupon}</span>
                  </p>
                )}
              </div>

              <div className="mb-6 rounded-2xl bg-slate-900 px-4 py-4 text-white shadow-lg shadow-slate-900/15">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Total Payable</span>
                  <span>Includes all charges</span>
                </div>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <span className="text-xl font-medium text-slate-200">Final Total</span>
                  <span className="text-3xl font-extrabold tracking-tight text-white">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="mb-2 w-full rounded-full bg-blue-600 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700 hover:shadow-lg"
              >
                Proceed to Checkout
              </button>

              <Link to="/shop" className="block text-center font-semibold text-blue-600 transition-all duration-300 hover:scale-[1.01] hover:text-blue-700">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
