import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { FiMapPin, FiPhoneCall } from 'react-icons/fi'
import { storeInfo } from '../config/store'
import { formatCurrency } from '../lib/currency'
import { getCurrentOrder } from '../lib/orders'

function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const currentOrder = getCurrentOrder()

    if (!currentOrder) {
      navigate('/orders', { replace: true })
      return
    }

    if (location.state?.orderId && location.state.orderId !== currentOrder.id) {
      navigate('/orders', { replace: true })
      return
    }

    setOrder(currentOrder)
  }, [location.state, navigate])

  const itemCount = useMemo(
    () => order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [order],
  )

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-900/10 sm:p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">Order Placed</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your order is confirmed</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Thank you for shopping at {storeInfo.name}. Your order has been saved and your shoes are now on the way to being packed.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order ID</p>
              <p className="mt-2 font-display text-lg font-bold text-slate-950">{order.id}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total</p>
              <p className="mt-2 font-display text-lg font-bold text-slate-950">{formatCurrency(order.totalPrice)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Items</p>
              <p className="mt-2 font-display text-lg font-bold text-slate-950">{itemCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery</p>
              <p className="mt-2 font-display text-lg font-bold text-slate-950">{order.estimatedDelivery}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-bold text-slate-900">What happens next</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                'Order saved in your history',
                'Packed by the warehouse team',
                'Track it from your Orders page',
              ].map((step) => (
                <div key={step} className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <h2 className="text-lg font-bold text-emerald-900">Need help with your order?</h2>
            <div className="mt-4 grid gap-3 text-sm text-emerald-900 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <FiPhoneCall className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-semibold">Call us</p>
                  <a href={`tel:${storeInfo.phone}`} className="block text-emerald-900 transition hover:text-emerald-700">
                    {storeInfo.phone}
                  </a>
                  <a href={`tel:${storeInfo.alternate}`} className="block text-emerald-900 transition hover:text-emerald-700">
                    {storeInfo.alternate}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-semibold">Visit the store</p>
                  <p>{storeInfo.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/orders"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-black hover:scale-[1.02]"
            >
              View Orders
            </Link>
            <Link
              to="/shop"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
