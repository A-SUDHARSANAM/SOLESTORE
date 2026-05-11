import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import { storeInfo as defaultStoreInfo } from '../config/store'
import { subscribeToStoreSettings } from '../services/settingsService'

const StoreSettingsContext = createContext(undefined)
const STORE_SETTINGS_DOC_ID = 'primary'

function normalizeStoreSettings(data = {}) {
  return {
    name: data.storeName ?? data.name ?? defaultStoreInfo.name,
    address: data.address ?? defaultStoreInfo.address,
    phone: data.phone ?? defaultStoreInfo.phone,
    alternate: data.alternate ?? data.alternatePhone ?? defaultStoreInfo.alternate,
    pincode: data.pincode ?? defaultStoreInfo.pincode,
    bannerText: data.bannerText ?? defaultStoreInfo.bannerText,
    footerText: data.footerText ?? defaultStoreInfo.footerText,
    adminEmails: Array.isArray(data.adminEmails) ? data.adminEmails : defaultStoreInfo.adminEmails,
    adminUids: Array.isArray(data.adminUids) ? data.adminUids : defaultStoreInfo.adminUids,
  }
}

export function StoreSettingsProvider({ children }) {
  const [storeSettings, setStoreSettings] = useState(defaultStoreInfo)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = subscribeToStoreSettings(
      STORE_SETTINGS_DOC_ID,
      (data) => {
        setStoreSettings(normalizeStoreSettings(data))
        setLoading(false)
        setError('')
      },
      (err) => {
        setError(err?.message || 'Failed to load store settings.')
        setStoreSettings(defaultStoreInfo)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      storeSettings,
      loading,
      error,
      storeSettingsId: STORE_SETTINGS_DOC_ID,
    }),
    [error, loading, storeSettings],
  )

  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext)
  if (!context) {
    throw new Error('useStoreSettings must be used within StoreSettingsProvider')
  }
  return context
}
