import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    reviews: 0,
  })

  useEffect(() => {
    if (!db) return undefined

    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setStats((prev) => ({ ...prev, products: snapshot.size }))
    })

    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setStats((prev) => ({ ...prev, orders: snapshot.size }))
    })

    const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      setStats((prev) => ({ ...prev, reviews: snapshot.size }))
    })

    return () => {
      unsubscribeProducts()
      unsubscribeOrders()
      unsubscribeReviews()
    }
  }, [])

  const cards = [
    { label: 'Products', value: stats.products },
    { label: 'Orders', value: stats.orders },
    { label: 'Reviews', value: stats.reviews },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Overview</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Monitor the latest activity across your store.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
