import { useEffect, useState } from 'react'
import { formatCurrency } from '../../lib/currency'
import { subscribeToOrders, updateOrderStatus } from '../../services/orderService'

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    return subscribeToOrders(setOrders, () => setOrders([]))
  }, [])

  const updateStatus = async (orderId, status) => {
    await updateOrderStatus(orderId, status)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Operations</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Orders</h1>
        <p className="mt-2 text-sm text-slate-600">Review customer orders and update delivery status.</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{order.id}</p>
                <p className="mt-1 text-xs text-slate-500">Placed on {order.date}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {order.customer?.name ?? 'Guest'} · {order.customer?.phone ?? 'NA'}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total</p>
                  <p className="mt-1 font-bold text-slate-900">{formatCurrency(order.totalPrice || 0)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
                  <select
                    value={order.status || 'Pending'}
                    onChange={(event) => updateStatus(order.id, event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {order.items?.length > 0 && (
              <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.id}-${item.size ?? 'default'}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity} · Size: {item.size ?? 'NA'}</p>
                    </div>
                    <p className="font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}

        {orders.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  )
}
