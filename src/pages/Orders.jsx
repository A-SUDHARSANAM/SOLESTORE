import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { formatCurrency } from '../lib/currency'
import { clearCurrentOrder, getOrders } from '../lib/orders'

function Orders() {
  const orders = useMemo(() => getOrders(), [])

  const handleClearCurrentOrder = () => {
    clearCurrentOrder()
    window.location.reload()
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-8 sm:py-12">
        <div className="mx-auto flex max-w-4xl items-center justify-center px-4 text-center">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white px-6 py-14 shadow-lg shadow-slate-900/10 sm:px-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-600 sm:text-base">
              You have no past orders yet. Place a demo order to see it here.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black hover:scale-105"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-600">Order History</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Past Orders</h1>
            <p className="mt-2 text-sm text-slate-600">Review all saved orders from your shoe store checkout flow.</p>
          </div>
          <button
            type="button"
            onClick={handleClearCurrentOrder}
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Current Order
          </button>
        </div>

        <div className="space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/10 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">{order.id}</h2>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Placed on {order.date}</p>
                  <p className="mt-1 text-sm text-slate-600">Estimated delivery: {order.estimatedDelivery}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-80">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Subtotal</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(order.subtotal)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={`${order.id}-${item.id}-${item.size ?? 'default'}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-slate-500">Qty: {item.quantity} · Size: {item.size ?? 'NA'}</p>
                      </div>
                      <p className="font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm font-medium text-slate-500">+ {order.items.length - 3} more item(s)</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 lg:min-w-48">
                  <p className="text-sm text-slate-600">
                    Payment: <span className="font-semibold text-slate-900">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay Demo UI'}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Customer: <span className="font-semibold text-slate-900">{order.customer.name}</span>
                  </p>
                  <Link
                    to="/orders"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Orders
