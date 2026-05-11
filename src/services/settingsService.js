import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function subscribeToStoreSettings(docId, onData, onError) {
  if (!db) {
    onData(null)
    return () => {}
  }

  const docRef = doc(db, 'storeSettings', docId)
  return onSnapshot(
    docRef,
    (snapshot) => onData(snapshot.exists() ? snapshot.data() : {}),
    onError,
  )
}

export async function updateStoreSettings(docId, payload) {
  if (!db) {
    throw new Error('Firestore is not configured.')
  }

  await setDoc(
    doc(db, 'storeSettings', docId),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
