import { useEffect, useState } from 'react'
import { useStoreSettings } from '../../context/StoreSettingsContext'
import { updateStoreSettings } from '../../services/settingsService'

export default function AdminStoreSettings() {
  const { storeSettings, storeSettingsId } = useStoreSettings()
  const [form, setForm] = useState(storeSettings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setForm(storeSettings)
  }, [storeSettings])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await updateStoreSettings(storeSettingsId, {
        storeName: form.name,
        address: form.address,
        phone: form.phone,
        alternate: form.alternate,
        pincode: form.pincode,
        bannerText: form.bannerText,
        footerText: form.footerText,
      })
      setMessage('Store settings updated.')
    } catch (err) {
      setMessage(err?.message || 'Unable to update store settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Brand</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Store Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Update the details shown across the storefront.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Store name
            <input
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Phone
            <input
              name="phone"
              value={form.phone || ''}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Alternate phone
            <input
              name="alternate"
              value={form.alternate || ''}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Pincode
            <input
              name="pincode"
              value={form.pincode || ''}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="text-sm font-semibold text-slate-700">
          Address
          <textarea
            name="address"
            value={form.address || ''}
            onChange={handleChange}
            rows="3"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Banner text (use "|" to split into two lines)
          <input
            name="bannerText"
            value={form.bannerText || ''}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Footer text
          <textarea
            name="footerText"
            value={form.footerText || ''}
            onChange={handleChange}
            rows="3"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        {message && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
