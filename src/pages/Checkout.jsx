import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { storeInfo } from '../config/store'
import { formatCurrency } from '../lib/currency'
import { saveOrder } from '../lib/orders'

function createOrderId() {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `SO-${Date.now().toString().slice(-6)}-${randomPart}`
}

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, totalPrice, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      navigate('/shop')
    }
  }, [cartItems.length, loading, navigate])

  const deliveryFee = 50
  const grandTotal = totalPrice + deliveryFee

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePlaceOrder = (event) => {
    event.preventDefault()
    setError('')

    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'pincode']
    const hasMissingField = requiredFields.some((field) => !formData[field].trim())

    if (hasMissingField) {
      setError('Please fill all delivery details.')
      return
    }

    setLoading(true)

    window.setTimeout(() => {
      const order = {
        id: createOrderId(),
        items: cartItems,
        subtotal: totalPrice,
        deliveryFee,
        totalPrice: grandTotal,
        paymentMethod,
        customer: formData,
        status: 'Placed',
        date: new Date().toLocaleString('en-IN'),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      }

      saveOrder(order)
      clearCart()
      navigate('/order-success', { state: { orderId: order.id } })
    }, 900)
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold">Delivery Address</h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 sm:col-span-2" />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500" />
                    <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500" />
                  </div>
                  <textarea name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500" />
                    <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleInputChange} className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="razorpay-demo">Razorpay Demo UI</option>
                </select>

                {paymentMethod === 'razorpay-demo' && (
                  <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                    Demo payment selected. No real payment gateway, keys, or verification will run.
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
                  {error}
                </div>
              )}
            </form>
          </div>

          <div>
            <div className="sticky top-24 rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

              <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{storeInfo.name}</p>
                    <p className="mt-1 text-slate-600">Delivery reference: {storeInfo.address}</p>
                    <p className="mt-1 text-slate-500">Pincode: {storeInfo.pincode}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size ?? 'default'}`} className="flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Processing Demo Payment...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
