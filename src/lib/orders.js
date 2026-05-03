const ORDERS_STORAGE_KEY = 'sole-orders-v1'
const CURRENT_ORDER_STORAGE_KEY = 'sole-current-order-v1'

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback
  } catch {
    return fallback
  }
}

export function getOrders() {
  return safeParse(localStorage.getItem(ORDERS_STORAGE_KEY), [])
}

export function saveOrder(order) {
  const nextOrders = [order, ...getOrders()]
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders))
  localStorage.setItem(CURRENT_ORDER_STORAGE_KEY, JSON.stringify(order))
  return order
}

export function getCurrentOrder() {
  return safeParse(localStorage.getItem(CURRENT_ORDER_STORAGE_KEY), null)
}

export function clearCurrentOrder() {
  localStorage.removeItem(CURRENT_ORDER_STORAGE_KEY)
}

export function clearOrders() {
  localStorage.removeItem(ORDERS_STORAGE_KEY)
  localStorage.removeItem(CURRENT_ORDER_STORAGE_KEY)
}
