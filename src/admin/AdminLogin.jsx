import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiLock, FiMail } from 'react-icons/fi'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useStoreSettings } from '../context/StoreSettingsContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, error, user, isAdmin } = useAdminAuth()
  const { storeSettings } = useStoreSettings()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const from = location.state?.from?.pathname || '/admin'

  useEffect(() => {
    if (user && isAdmin) {
      navigate(from, { replace: true })
    }
  }, [from, isAdmin, navigate, user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    await signIn(email.trim(), password)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-12">
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Admin Login</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            {storeSettings.name} Dashboard
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Sign in with your admin account to manage products, orders, and store settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <FiMail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@stepouts.com"
                className="w-full text-sm font-medium text-slate-800 outline-none"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Password</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <FiLock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
                className="w-full text-sm font-medium text-slate-800 outline-none"
                required
              />
            </div>
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need admin access? Add your email to the allowed admin list in Firebase.
        </div>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  )
}
