function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_22%),radial-gradient(circle_at_90%_30%,_rgba(14,165,233,0.16),_transparent_22%)]" />
      <div className="site-shell relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <p className="font-display text-3xl font-extrabold tracking-tight text-white">
              SOLE
              <span className="ml-1 text-amber-400">STORE</span>
            </p>
            <p className="mt-5 text-sm font-medium leading-7 text-slate-300">
              Modern footwear retail with the feel of a premium brand campaign. Discover
              elevated everyday pairs, sport-driven essentials, and statement silhouettes in one
              place.
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
            <div className="mt-5 space-y-3 text-sm font-medium text-slate-200">
              <p>support@solestore.com</p>
              <p>Mon-Sat, 9 AM to 7 PM</p>
              <p>Worldwide brand-inspired delivery</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} SoleStore. Move better. Dress sharper.</p>
          <p>Scroll-driven design for modern footwear discovery.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
