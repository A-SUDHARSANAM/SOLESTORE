import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const CartContext = createContext(undefined)
const STORAGE_KEY = 'sole-cart-v1'

function getInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getInitialCart)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimerRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
    } catch {
      // Ignore storage failures in demo mode.
    }
  }, [cartItems])

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== STORAGE_KEY) return

      try {
        setCartItems(event.newValue ? JSON.parse(event.newValue) : [])
      } catch {
        setCartItems([])
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current)
    setToastMessage(message)
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('')
    }, 2500)
  }

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current)
  }, [])

  const addToCart = (product, size = null, maxStock = null, options = {}) => {
    const { silent = false } = options
    const existingItem = cartItems.find(
      (item) => item.id === product.id && item.size === size,
    )

    if (maxStock !== null && (existingItem?.quantity ?? 0) >= maxStock) {
      if (!silent) {
        showToast('Selected size is out of stock')
      }
      return false
    }

    setCartItems((prev) => {
      const currentItem = prev.find(
        (item) => item.id === product.id && item.size === size,
      )

      if (currentItem) {
        return prev.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [
        ...prev,
        {
          ...product,
          image: product.image || product.images?.[0] || '',
          size,
          quantity: 1,
        },
      ]
    })
    showToast('Added to cart')
    return true
  }

  const removeFromCart = (productId, size = null) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.size === size)),
    )
  }

  const updateQuantity = (productId, size = null, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size)
      return
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.size === size ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  )

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    itemCount,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`fixed right-4 top-5 z-50 transition-all duration-300 sm:right-6 ${
          toastMessage
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-3 opacity-0'
        }`}
      >
        <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-2xl shadow-slate-900/10">
          {toastMessage}
        </div>
      </div>
    </CartContext.Provider>
  )
}

function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}

export { CartProvider, useCart }
