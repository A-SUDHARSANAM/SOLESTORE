import { Link } from 'react-router-dom'
import { useStoreSettings } from '../context/StoreSettingsContext'

function Banner() {
  const { storeSettings } = useStoreSettings()
  const bannerText = storeSettings.bannerText || 'Built For Speed | Styled For Streets'
  const [bannerPrimary, bannerSecondary] = bannerText.split('|').map((segment) => segment.trim())

  return (
    <section className="relative overflow-hidden rounded-3xl bg-ink text-white shadow-premium">
      <div className="pointer-events-none absolute -left-20 top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 rounded-full bg-amber-500/40 blur-3xl" />

      <div className="relative grid items-center gap-8 px-6 py-12 sm:px-10 md:grid-cols-[1.2fr_0.8fr] md:py-16">
        <div className="max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">New Season</p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
            {bannerPrimary}
            {bannerSecondary && <span className="block text-slate-300">{bannerSecondary}</span>}
          </h1>
          <p className="mt-4 max-w-md text-sm text-slate-300 sm:text-base">
            Discover premium sneakers built for comfort, performance, and street style.
          </p>
          <Link
            to="/shop"
            className="mt-7 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-bold text-ink transition duration-300 hover:translate-y-[-2px] hover:bg-slate-200"
          >
            Shop Collection
          </Link>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-sm backdrop-blur-xl sm:p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Limited Offer</p>
          <p className="mt-2 text-2xl font-bold text-white">20% Off</p>
          <p className="mt-2 text-slate-200">On selected running essentials this week only.</p>
          <div className="mt-5 h-px w-full bg-white/20" />
          <p className="mt-4 text-xs text-slate-300">Use code: RUNFAST20</p>
        </div>
      </div>
    </section>
  )
}

export default Banner
