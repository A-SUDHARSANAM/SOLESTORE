import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import productsData from '../data/products'

const ProductContext = createContext(undefined)
const RECENTLY_VIEWED_STORAGE_KEY = 'sole-recently-viewed-v1'

function getInitialRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function ProductProvider({ children }) {
  const [products] = useState(productsData)

  const getProductById = useCallback(
    (productId) => products.find((product) => String(product.id) === String(productId)),
    [products],
  )

  const getTotalStock = useCallback(
    (product) => (product?.sizes ?? []).reduce((sum, entry) => sum + Number(entry.stock || 0), 0),
    [],
  )

  const recordRecentlyViewed = useCallback((productId) => {
    if (productId === undefined || productId === null) return

    try {
      const nextIds = [String(productId), ...getInitialRecentlyViewedIds().filter((id) => String(id) !== String(productId))].slice(0, 8)
      localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(nextIds))
    } catch {
      // ignore storage failures in demo mode
    }
  }, [])

  const getRecentlyViewedProducts = useCallback(
    (limit = 4) => {
      const recentlyViewedIds = getInitialRecentlyViewedIds()

      return recentlyViewedIds
        .map((productId) => products.find((product) => String(product.id) === String(productId)))
        .filter(Boolean)
        .slice(0, limit)
    },
    [products],
  )

  const value = useMemo(
    () => ({
      products,
      getProductById,
      getTotalStock,
      getRecentlyViewedProducts,
      recordRecentlyViewed,
      productsLoading: false,
      productsError: '',
    }),
    [getProductById, getRecentlyViewedProducts, getTotalStock, products, recordRecentlyViewed],
  )

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider')
  }
  return context
}

export default ProductProvider
