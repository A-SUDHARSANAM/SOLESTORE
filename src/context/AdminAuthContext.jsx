import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import { signInAdmin, signOutUser as signOutAdmin, subscribeToAuthState } from '../services/authService'
import { useStoreSettings } from './StoreSettingsContext'
import { isAdminUser } from '../lib/admin'

const AdminAuthContext = createContext(undefined)

function mapAuthError(error) {
  const code = error?.code || ''
  if (code.includes('auth/invalid-credential')) return 'Invalid email or password.'
  if (code.includes('auth/user-disabled')) return 'This account is disabled.'
  if (code.includes('auth/too-many-requests')) return 'Too many attempts. Try again later.'
  return error?.message || 'Unable to sign in.'
}

export function AdminAuthProvider({ children }) {
  const { storeSettings } = useStoreSettings()
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false)
      return undefined
    }

    const unsubscribe = subscribeToAuthState(
      (currentUser) => {
        setUser(currentUser)
        setAuthLoading(false)
      },
      (err) => {
        setError(err?.message || 'Failed to load authentication.')
        setAuthLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const isAdmin = useMemo(
    () => isAdminUser(user, storeSettings),
    [storeSettings, user],
  )

  const signIn = async (email, password) => {
    setError('')

    try {
      return await signInAdmin(email, password)
    } catch (err) {
      setError(mapAuthError(err))
      return null
    }
  }

  const signOutUser = async () => {
    await signOutAdmin()
  }

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading: authLoading,
      error,
      signIn,
      signOut: signOutUser,
    }),
    [authLoading, error, isAdmin, user],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
