import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { ProductProvider } from './context/ProductContext'
import { StoreSettingsProvider } from './context/StoreSettingsContext'
import { WishlistProvider } from './context/WishlistContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreSettingsProvider>
      <AdminAuthProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </AdminAuthProvider>
    </StoreSettingsProvider>
  </StrictMode>,
)
