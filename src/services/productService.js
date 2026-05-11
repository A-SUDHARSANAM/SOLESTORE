import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

export function normalizeProductSnapshot(docSnap) {
  const data = docSnap.data()
  const primaryImage = data.imageUrl ?? data.image ?? ''
  const rawSizes = Array.isArray(data.availableSizes)
    ? data.availableSizes
    : Array.isArray(data.sizes)
      ? data.sizes
      : []
  const normalizedSizes = rawSizes.map((entry) =>
    typeof entry === 'object' && entry !== null
      ? entry
      : { size: entry, stock: Number(data.stock || 0) },
  )
  const availableSizes = normalizedSizes
    .map((entry) => entry?.size)
    .filter((size) => size !== undefined && size !== null)
  const totalStock = normalizedSizes.reduce((sum, entry) => sum + Number(entry.stock || 0), 0)
  const createdAtMs =
    typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : 0

  return {
    id: docSnap.id,
    name: data.name ?? '',
    brand: data.brand ?? '',
    category: data.category ?? '',
    price: Number(data.price ?? 0),
    originalPrice: data.originalPrice ?? null,
    description: data.description ?? '',
    sizes: normalizedSizes,
    availableSizes,
    stock: totalStock || Number(data.stock || 0),
    featured: Boolean(data.featured),
    trending: Boolean(data.trending),
    image: primaryImage,
    imageUrl: primaryImage,
    images: Array.isArray(data.images)
      ? data.images
      : primaryImage
        ? [primaryImage]
        : [],
    rating: data.rating ?? 4.5,
    createdAt: data.createdAt ?? null,
    createdAtMs,
  }
}

export function createProductId() {
  if (!db) {
    throw new Error('Firestore is not configured.')
  }

  return doc(collection(db, 'products')).id
}

export async function addProduct(productId, payload) {
  if (!db) {
    throw new Error('Firestore is not configured.')
  }

  const docRef = doc(db, 'products', productId)
  await setDoc(docRef, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function updateProduct(productId, payload) {
  if (!db) {
    throw new Error('Firestore is not configured.')
  }

  const docRef = doc(db, 'products', productId)
  await updateDoc(docRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProduct(productId) {
  if (!db) {
    throw new Error('Firestore is not configured.')
  }

  await deleteDoc(doc(db, 'products', productId))
}

export async function getProducts() {
  if (!db) {
    return []
  }

  const snapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map(normalizeProductSnapshot)
}

export function subscribeToProducts(onData, onError) {
  if (!db) {
    onData([])
    return () => {}
  }

  // Real-time listener keeps the storefront and admin in sync.
  const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    productsQuery,
    (snapshot) => {
      try {
        const products = snapshot.docs.map(normalizeProductSnapshot)
        console.log('[productService] Fetched products', products)
        console.log(
          '[productService] Product image URLs',
          products.map(({ id, name, imageUrl }) => ({ id, name, imageUrl })),
        )
        onData(products)
      } catch (error) {
        console.error('[productService] Failed to normalize products', error)
        onError?.(error)
      }
    },
    (error) => {
      console.error('[productService] Firestore subscription error', error)
      onError?.(error)
    },
  )
}
