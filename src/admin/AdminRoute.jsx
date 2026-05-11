import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isFirebaseConfigured } from '../firebase'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminRoute() {
  const location = useLocation()
  const { user, isAdmin, loading, signOut } = useAdminAuth()

  if (!isFirebaseConfigured) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Firebase not configured</h1>
        <p className="mt-3 text-sm text-slate-600">
          Add your Firebase environment variables to enable the admin dashboard.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-sm font-semibold text-slate-600">Checking admin access...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your account does not have admin permissions. Contact the store owner to get access.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    )
  }

  return <Outlet />
}
