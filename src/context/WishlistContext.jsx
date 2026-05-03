import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const WishlistContext = createContext(undefined)
const STORAGE_KEY = 'sole-wishlist-v1'

function getInitialWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(getInitialWishlist)

  const persistWishlist = (nextWishlistIds) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWishlistIds))
    return nextWishlistIds
  }

  const toggleWishlist = useCallback((productId) => {
    setWishlistIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]

      return persistWishlist(next)
    })
  }, [])

  const addToWishlist = useCallback((productId) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        return prev
      }

      return persistWishlist([...prev, productId])
    })
  }, [])

  const removeFromWishlist = useCallback((productId) => {
    setWishlistIds((prev) => {
      if (!prev.includes(productId)) {
        return prev
      }

      return persistWishlist(prev.filter((id) => id !== productId))
    })
  }, [])

  const value = useMemo(
    () => ({
      wishlistIds,
      wishlistCount: wishlistIds.length,
      isWishlisted: (productId) => wishlistIds.includes(productId),
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    }),
    [addToWishlist, removeFromWishlist, toggleWishlist, wishlistIds],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

function useWishlist() {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }

  return context
}

export { WishlistProvider, useWishlist }
