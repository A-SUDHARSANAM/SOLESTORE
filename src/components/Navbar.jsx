import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMenu, FiPhoneCall, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { storeInfo } from '../config/store'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/cart', label: 'Cart' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/orders', label: 'Orders' },
]

function Navbar() {
  const { itemCount } = useCart()
  const { wishlistCount } = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const searchQuery = new URLSearchParams(location.search).get('q') ?? ''
  const [brandPrimary, brandAccentRaw] = storeInfo.name.split('_')
  const brandAccent = brandAccentRaw ? `_${brandAccentRaw}` : ''
  const brandPrimaryChars = Array.from(brandPrimary)
  const brandAccentChars = Array.from(brandAccent)
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
    <label className="relative w-full max-w-2xl">
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
        className="h-11 w-full rounded-full border border-slate-200 bg-white px-10 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all duration-300 hover:shadow-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      />
    </label>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/80 backdrop-blur-xl">
      <nav className="site-shell px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="group shrink-0 cursor-pointer font-display text-2xl font-extrabold tracking-[0.14em] text-ink transition-all duration-300 hover:scale-[1.05] hover:drop-shadow-[0_0_16px_rgba(251,146,60,0.6)] sm:text-3xl"
            >
              <span className="sr-only">{storeInfo.name}</span>
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

          <div className="hidden flex-1 justify-center md:flex">
            {searchField}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-4 md:flex">
              <ul className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-premium">
                {links.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] ${
                          isActive
                            ? 'bg-ink text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
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
              <a
                href={`tel:${storeInfo.phone}`}
                className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-premium transition hover:bg-slate-50 lg:inline-flex"
                aria-label={`Call ${storeInfo.name}`}
              >
                <FiPhoneCall className="h-4 w-4 text-amber-600" />
                {storeInfo.phone}
              </a>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="pb-4 md:hidden">{searchField}</div>

        {menuOpen && (
          <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-premium md:hidden">
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-ink text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
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
            <a
              href={`tel:${storeInfo.phone}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-premium transition hover:bg-slate-50"
              aria-label={`Call ${storeInfo.name}`}
            >
              <FiPhoneCall className="h-4 w-4 text-amber-600" />
              {storeInfo.phone}
            </a>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
