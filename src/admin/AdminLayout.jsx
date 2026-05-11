import { NavLink, Outlet } from 'react-router-dom'
import { FiBox, FiGrid, FiLogOut, FiSettings, FiShoppingBag, FiStar } from 'react-icons/fi'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useStoreSettings } from '../context/StoreSettingsContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/reviews', label: 'Reviews', icon: FiStar },
  { to: '/admin/settings', label: 'Store Settings', icon: FiSettings },
]

export default function AdminLayout() {
  const { signOut, user } = useAdminAuth()
  const { storeSettings } = useStoreSettings()

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Admin</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">
              {storeSettings.name}
            </p>
          </div>
          <nav className="mt-10 flex flex-1 flex-col gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={signOut}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <FiLogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <div className="lg:hidden">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Admin</p>
              <p className="text-lg font-bold text-slate-900">{storeSettings.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Signed in</p>
                <p className="text-sm font-semibold text-slate-800">{user?.email ?? 'Admin'}</p>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden"
              >
                <FiLogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
