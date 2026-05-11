import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export async function createOrder(order) {
  if (!db) return null

  const docRef = doc(db, 'orders', String(order.id))
  await setDoc(
    docRef,
    {
      ...order,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )

  return docRef.id
}

export function subscribeToOrders(onData, onError) {
  if (!db) {
    onData([])
    return () => {}
  }

  const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    ordersQuery,
    (snapshot) => onData(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))),
    onError,
  )
}

export async function updateOrderStatus(orderId, status) {
  if (!db) return
  await updateDoc(doc(db, 'orders', orderId), { status })
}
