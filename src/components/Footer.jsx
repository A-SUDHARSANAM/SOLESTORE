import { FiMapPin, FiPhoneCall } from 'react-icons/fi'
import { useStoreSettings } from '../context/StoreSettingsContext'

function Footer() {
  const { storeSettings } = useStoreSettings()

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_22%),radial-gradient(circle_at_90%_30%,_rgba(14,165,233,0.16),_transparent_22%)]" />
      <div className="site-shell relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <p className="font-display text-3xl font-extrabold tracking-tight text-white">
              <span className="text-amber-400">{storeSettings.name}</span>
            </p>
            <p className="mt-5 text-sm font-medium leading-7 text-slate-300">
              {storeSettings.footerText}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Shop</p>
            <div className="mt-5 space-y-3 text-sm font-medium text-slate-200">
              <p>Featured Shoes</p>
              <p>Trending Products</p>
              <p>Formal Collection</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Categories</p>
            <div className="mt-5 space-y-3 text-sm font-medium text-slate-200">
              <p>Casual</p>
              <p>Sports</p>
              <p>Formal</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Contact</p>
            <div className="mt-5 space-y-4 text-sm font-medium text-slate-200">
              <div className="flex items-start gap-3">
                <FiMapPin className="mt-0.5 h-4 w-4 text-amber-300" />
                <p>{storeSettings.address}</p>
              </div>
              <div className="flex items-start gap-3">
                <FiPhoneCall className="mt-0.5 h-4 w-4 text-amber-300" />
                <div className="space-y-1">
                  <a href={`tel:${storeSettings.phone}`} className="block transition hover:text-white">
                    {storeSettings.phone}
                  </a>
                  <a href={`tel:${storeSettings.alternate}`} className="block transition hover:text-white">
                    {storeSettings.alternate}
                  </a>
                </div>
              </div>
              <p className="text-slate-400">Pincode: {storeSettings.pincode}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {storeSettings.name}. Move better. Dress sharper.</p>
          <p>Scroll-driven design for modern footwear discovery.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
