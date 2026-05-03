import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

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
  const location = useLocation()
  const navigate = useNavigate()
  const searchQuery = new URLSearchParams(location.search).get('q') ?? ''

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

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/80 backdrop-blur-xl">
      <nav className="site-shell flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between lg:py-5">
        <div className="flex items-center justify-between gap-3">
          <NavLink to="/" className="shrink-0 font-display text-2xl font-extrabold tracking-tight text-ink transition-all duration-300 hover:scale-[1.02] sm:text-[1.7rem]">
            SOLE
            <span className="ml-1 text-amber-600">STORE</span>
          </NavLink>
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 lg:hidden">
            {wishlistCount} saved
          </span>
        </div>

        <label className="relative order-3 w-full lg:order-none lg:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

        <div className="flex items-center gap-3">
          <ul className="flex flex-wrap items-center gap-1 rounded-full border border-slate-200/80 bg-white/85 p-1 shadow-premium sm:gap-2">
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
                  </span>
                </NavLink>
              </li>
            ))}
            <li className="hidden lg:block">
              <span className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-rose-600">
                <span aria-hidden="true">♡</span>
                {wishlistCount}
              </span>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
