import { useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMenu, FiPhoneCall, FiUser, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductContext'
import { useWishlist } from '../context/WishlistContext'
import { useStoreSettings } from '../context/StoreSettingsContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/cart', label: 'Cart' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/orders', label: 'Orders' },
]

function Navbar() {
  const { itemCount } = useCart()
  const { wishlistIds } = useWishlist()
  const { products } = useProducts()
  const { storeSettings } = useStoreSettings()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const searchQuery = new URLSearchParams(location.search).get('q') ?? ''
  const [brandPrimary, brandAccentRaw] = (storeSettings.name || '').split('_')
  const brandAccent = brandAccentRaw ? `_${brandAccentRaw}` : ''
  const brandPrimaryChars = Array.from(brandPrimary)
  const brandAccentChars = Array.from(brandAccent)
  const wishlistCount = useMemo(() => {
    if (!products.length || !wishlistIds.length) return 0

    return wishlistIds.filter((wishlistId) =>
      products.some((product) => String(product.id) === String(wishlistId)),
    ).length
  }, [products, wishlistIds])
  const logoContainerMotion = {
    hidden: { opacity: 0, y: -10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.04,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }
  const logoLetterMotion = {
    hidden: { opacity: 0, y: -10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const handleSearch = (event) => {
    const value = event.target.value
    const params = new URLSearchParams(location.pathname === '/shop' ? location.search : '')

    if (value.trim()) {
      params.set('q', value)
    } else {
      params.delete('q')
    }

    navigate(
      {
        pathname: '/shop',
        search: params.toString() ? `?${params.toString()}` : '',
      },
      { replace: location.pathname === '/shop' },
    )
  }

  const searchField = (
    <label className="relative w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 0 1-13 0 6.5 6.5 0 0 1 13 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="search"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search shoes by name"
        className="h-11 w-full rounded-full border border-white/30 bg-white/25 px-10 text-sm font-medium text-slate-800 shadow-sm outline-none backdrop-blur-[18px] transition duration-300 focus:border-amber-300/70 focus:bg-white/60 focus:ring-2 focus:ring-amber-100"
      />
    </label>
  )

  return (
    <header className="glass-navbar sticky top-0 z-40">
      <nav className="site-shell py-3">
        <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
            <NavLink
              to="/"
              className="shrink-0 cursor-pointer font-display text-xl font-extrabold tracking-[0.12em] text-ink transition hover:text-slate-700 sm:text-2xl"
            >
              <span className="sr-only">{storeSettings.name}</span>
              <motion.span
                aria-hidden="true"
                variants={logoContainerMotion}
                initial="hidden"
                animate="show"
                className="inline-flex items-baseline gap-1"
              >
                <span className="font-extrabold text-slate-950">
                  {brandPrimaryChars.map((char, index) => (
                    <motion.span key={`${char}-${index}`} variants={logoLetterMotion}>
                      {char}
                    </motion.span>
                  ))}
                </span>
                <span className="font-extrabold text-transparent bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text drop-shadow-[0_0_10px_rgba(251,146,60,0.45)]">
                  {brandAccentChars.map((char, index) => (
                    <motion.span key={`${char}-${index}`} variants={logoLetterMotion}>
                      {char}
                    </motion.span>
                  ))}
                </span>
              </motion.span>
            </NavLink>
          </div>

          <div className="order-3 w-full sm:order-none sm:flex sm:min-w-[16rem] sm:flex-1 lg:max-w-md">
            {searchField}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-3 lg:flex">
              <ul className="flex items-center gap-1 rounded-full border border-white/30 bg-white/25 p-1 shadow-sm backdrop-blur-[18px]">
                {links.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `rounded-full px-3 py-2 text-sm font-semibold transition ${
                          isActive
                            ? 'bg-gradient-to-r from-slate-950 to-amber-800 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-white/45 hover:text-ink'
                        }`
                      }
                    >
                      <span className="inline-flex items-center gap-2">
                        {link.label}
                        {link.to === '/cart' && itemCount > 0 && (
                          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                            {itemCount}
                          </span>
                        )}
                        {link.to === '/wishlist' && wishlistCount > 0 && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                            {wishlistCount}
                          </span>
                        )}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
              <NavLink
                to="/admin"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/25 text-slate-700 shadow-sm backdrop-blur-[18px] transition duration-300 hover:bg-white/50"
                aria-label="Go to admin dashboard"
              >
                <FiUser className="h-4 w-4 text-slate-700" />
              </NavLink>
              <a
                href={`tel:${storeSettings.phone}`}
                className="hidden items-center gap-2 rounded-full border border-white/30 bg-white/25 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-[18px] transition duration-300 hover:bg-white/50 xl:inline-flex"
                aria-label={`Call ${storeSettings.name}`}
              >
                <FiPhoneCall className="h-4 w-4 text-amber-600" />
                {storeSettings.phone}
              </a>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/30 text-slate-700 shadow-sm backdrop-blur-[18px] transition duration-300 hover:bg-white/55 lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="glass-panel mt-3 rounded-2xl p-4 lg:hidden">
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-gradient-to-r from-slate-950 to-amber-800 text-white'
                          : 'text-slate-600 hover:bg-white/45 hover:text-ink'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    <span className="flex items-center gap-2">
                      {link.to === '/cart' && itemCount > 0 && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                          {itemCount}
                        </span>
                      )}
                      {link.to === '/wishlist' && wishlistCount > 0 && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                          {wishlistCount}
                        </span>
                      )}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
            <NavLink
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/30 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:bg-white/55"
              aria-label="Go to admin dashboard"
            >
              <FiUser className="h-4 w-4 text-slate-700" />
              Admin
            </NavLink>
            <a
              href={`tel:${storeSettings.phone}`}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/30 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:bg-white/55"
              aria-label={`Call ${storeSettings.name}`}
            >
              <FiPhoneCall className="h-4 w-4 text-amber-600" />
              {storeSettings.phone}
            </a>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
