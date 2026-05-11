import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase'

export function subscribeToAuthState(onChange, onError) {
  if (!auth) {
    onChange(null)
    return () => {}
  }

  return onAuthStateChanged(auth, onChange, onError)
}

export async function signInAdmin(email, password) {
  if (!auth) {
    throw new Error('Firebase authentication is not configured.')
  }

  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signOutUser() {
  if (!auth) return
  await signOut(auth)
}
