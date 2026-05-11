import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function addReview(payload) {
  if (!db) return null

  const docRef = await addDoc(collection(db, 'reviews'), {
    ...payload,
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export function subscribeToReviews(onData, onError) {
  if (!db) {
    onData([])
    return () => {}
  }

  const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    reviewsQuery,
    (snapshot) => onData(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
    onError,
  )
}

export function subscribeToReviewsByProduct(productId, onData, onError) {
  if (!db) {
    onData([])
    return () => {}
  }

  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('productId', '==', String(productId)),
  )

  return onSnapshot(
    reviewsQuery,
    (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      docs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0
        const timeB = b.createdAt?.toMillis?.() || 0
        return timeB - timeA
      })
      onData(docs)
    },
    onError,
  )
}

export async function updateReview(reviewId, payload) {
  if (!db) return
  await updateDoc(doc(db, 'reviews', reviewId), payload)
}

export async function deleteReview(reviewId) {
  if (!db) return
  await deleteDoc(doc(db, 'reviews', reviewId))
}
