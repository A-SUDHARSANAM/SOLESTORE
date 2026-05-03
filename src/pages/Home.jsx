import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'
import { formatCurrency } from '../lib/currency'

const viewportSettings = { once: true, amount: 0.25 }

const revealUp = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const softReveal = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const staggerGrid = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

function SectionIntro({ eyebrow, title, description, theme = 'light' }) {
  const titleClass = theme === 'dark' ? 'text-white' : 'text-slate-950'
  const descriptionClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-600'

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewportSettings}
      variants={revealUp}
      className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left"
    >
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-600">{eyebrow}</p>
      <h2 className={`mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${titleClass}`}>
        {title}
      </h2>
      <p className={`mt-4 text-sm font-medium leading-7 sm:text-base ${descriptionClass}`}>
        {description}
      </p>
    </motion.div>
  )
}

function FeaturedCarousel({ products }) {
  const carouselRef = useRef(null)

  const scrollByAmount = (direction) => {
    if (!carouselRef.current) return

    const container = carouselRef.current
    const amount = Math.min(container.clientWidth * 0.9, 420)

    container.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    })
  }

  const handleWheel = (event) => {
    const container = carouselRef.current

    if (!container || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return
    }

    event.preventDefault()
    container.scrollBy({
      left: event.deltaY,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => scrollByAmount('prev')}
          className="ui-button-outline inline-flex h-11 w-11 items-center justify-center text-xl font-bold"
          aria-label="Scroll featured shoes left"
        >
          &#8249;
        </button>
        <button
          type="button"
          onClick={() => scrollByAmount('next')}
          className="ui-button-outline inline-flex h-11 w-11 items-center justify-center text-xl font-bold"
          aria-label="Scroll featured shoes right"
        >
          &#8250;
        </button>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-[#f7f8fa] to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-[#f7f8fa] to-transparent lg:block" />

      <motion.div
        ref={carouselRef}
        onWheel={handleWheel}
        initial="hidden"
        whileInView="show"
        viewport={viewportSettings}
        variants={staggerGrid}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none]"
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={softReveal}
            className="w-[82vw] max-w-[22rem] shrink-0 snap-start sm:w-[22rem] lg:w-[24rem]"
          >
            <div className="transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]">
              <ProductCard product={product} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function Home() {
  const { products, productsLoading, productsError, getRecentlyViewedProducts } = useProducts()
  const heroRef = useRef(null)

  const featuredProducts = products.slice(0, 4)
  const trendingProducts = [...products]
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 4)
  const heroProduct = featuredProducts[0] ?? products[0]

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroParallaxY = useSpring(useTransform(heroScrollProgress, [0, 1], [0, 120]), {
    stiffness: 90,
    damping: 24,
    mass: 0.45,
  })
  const heroContentY = useSpring(useTransform(heroScrollProgress, [0, 1], [0, 36]), {
    stiffness: 110,
    damping: 26,
    mass: 0.4,
  })
  const heroOverlayOpacity = useTransform(heroScrollProgress, [0, 1], [1, 0.9])
  const recentlyViewedProducts = getRecentlyViewedProducts(4)

  const categories = [
    {
      name: 'Formal',
      title: 'Sharp silhouettes for office hours and dressed-up evenings.',
      description:
        'Polished textures, refined comfort, and versatile pairs that hold their own from weekday meetings to weekend events.',
      image: products.find((product) => product.category === 'Formal')?.image ?? heroProduct?.image,
      href: '/shop?category=Formal',
      accent: 'from-slate-950/92 via-slate-900/48 to-transparent',
      layout: 'lg:col-span-5',
    },
    {
      name: 'Casual',
      title: 'Relaxed essentials built for everyday movement.',
      description:
        'Soft cushioning, lightweight uppers, and effortless styling for long city days, easy travel, and off-duty looks.',
      image: products.find((product) => product.category === 'Casual')?.image ?? heroProduct?.image,
      href: '/shop?category=Casual',
      accent: 'from-amber-900/88 via-amber-600/32 to-transparent',
      layout: 'lg:col-span-3',
    },
    {
      name: 'Sports',
      title: 'Performance-first footwear engineered to keep pace.',
      description:
        'Breathable construction, responsive support, and bold energy for training sessions, fast runs, and high-output routines.',
      image: products.find((product) => product.category === 'Sports')?.image ?? heroProduct?.image,
      href: '/shop?category=Sports',
      accent: 'from-emerald-950/88 via-emerald-700/30 to-transparent',
      layout: 'lg:col-span-4',
    },
  ]

  const brandShowcase = [
    { name: 'Nike', note: 'Air-driven icons', value: '24 drops' },
    { name: 'Adidas', note: 'Street and training hybrids', value: '18 drops' },
    { name: 'Puma', note: 'Bold retro energy', value: '12 drops' },
    { name: 'New Balance', note: 'Comfort-led classics', value: '15 drops' },
    { name: 'Skechers', note: 'Everyday ease', value: '10 drops' },
  ]

  const testimonials = [
    {
      name: 'Riya Sharma',
      role: 'Creative Lead',
      quote:
        'The landing experience feels premium, but the bigger win is how quickly I can jump from inspiration to checkout.',
    },
    {
      name: 'Arjun Mehta',
      role: 'Fitness Coach',
      quote:
        'I found the right training pair in minutes. The sections make browsing feel curated instead of overwhelming.',
    },
    {
      name: 'Sana Kapoor',
      role: 'Style Consultant',
      quote:
        'It has the polish of a modern brand site with enough clarity that customers always know where to go next.',
    },
  ]

  return (
    <div id="top" className="bg-transparent">
      <section ref={heroRef} className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-white">
        <motion.img
          src={heroProduct?.image}
          alt={heroProduct?.name ?? 'Hero shoe'}
          className="absolute inset-0 h-[112%] w-full object-cover will-change-transform"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: heroParallaxY }}
        />
        <motion.div
          style={{ opacity: heroOverlayOpacity }}
          className="absolute inset-0 bg-[linear-gradient(110deg,_rgba(2,6,23,0.9)_0%,_rgba(15,23,42,0.72)_38%,_rgba(15,23,42,0.32)_65%,_rgba(2,6,23,0.78)_100%)]"
        />
        <motion.div
          style={{ opacity: heroOverlayOpacity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(245,158,11,0.18),_transparent_24%),radial-gradient(circle_at_82%_18%,_rgba(56,189,248,0.14),_transparent_20%)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        <motion.div
          style={{ y: heroContentY }}
          className="site-shell relative flex min-h-screen items-end py-14 sm:py-16 lg:items-center"
        >
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerGrid}
            className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.1fr)_20rem]"
          >
            <div className="max-w-4xl">
              <motion.div variants={softReveal} className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 backdrop-blur-xl">
                New Season
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Curated performance and street icons
              </motion.div>

              <motion.h1 variants={revealUp} className="mt-7 max-w-4xl font-display text-6xl font-extrabold leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-[7.5rem]">
                Step Into Style
              </motion.h1>

              <motion.p variants={softReveal} className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-200 sm:text-lg">
                Discover premium sneakers and everyday essentials designed to move with confidence,
                comfort, and the kind of bold visual energy you expect from world-class sportswear brands.
              </motion.p>

              <motion.div variants={softReveal} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.25 }}>
                  <Link
                    to="/shop"
                    className="ui-button-light inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] shadow-[0_18px_40px_-20px_rgba(255,255,255,0.65)]"
                  >
                    Shop Now
                  </Link>
                </motion.div>
                <motion.a
                  href="#featured"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-200 transition-all duration-300 hover:scale-[1.02] hover:text-white"
                >
                  Explore Collection
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-sm backdrop-blur-xl transition-all duration-300">
                    +
                  </span>
                </motion.a>
              </motion.div>
            </div>

            <motion.div variants={softReveal} className="flex items-end lg:justify-end">
              <div className="ui-card-lift w-full max-w-xs rounded-[2rem] border border-white/12 bg-white/10 p-5 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Featured Drop</p>
                <p className="mt-3 font-display text-3xl font-bold text-white">{heroProduct?.name}</p>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-300">{heroProduct?.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Starting at</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {heroProduct ? formatCurrency(heroProduct.price) : ''}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
                    Premium
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section id="featured" className="scroll-mt-28 bg-transparent py-20 sm:py-24">
        <div className="site-shell">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro
              eyebrow="Featured Shoes"
              title="Top picks that anchor the season."
              description="Our standout selection balances comfort, versatility, and the kind of visual presence you expect from premium footwear collections."
            />
            <Link
              to="/shop"
              className="ui-button-outline inline-flex items-center justify-center self-start px-6 py-3 text-sm font-bold"
            >
              View All Products
            </Link>
          </div>

          {productsError && (
            <p className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {productsError}
            </p>
          )}

          {productsLoading ? (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewportSettings}
              variants={staggerGrid}
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.div key={index} variants={softReveal} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />
                  <div className="mt-4 h-4 w-24 animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-3 h-6 w-40 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-6 h-5 w-28 animate-pulse rounded-full bg-slate-100" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <FeaturedCarousel products={featuredProducts} />
          )}
        </div>
      </section>

      <section id="categories" className="scroll-mt-28 bg-white py-20 sm:py-24">
        <div className="site-shell">
          <SectionIntro
            eyebrow="Categories"
            title="Three worlds of footwear, one seamless destination."
            description="Move through clean formal pairs, easy everyday staples, and performance-focused runners without losing the premium editorial feel."
          />

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportSettings}
            variants={staggerGrid}
            className="mt-12 grid gap-6 lg:grid-cols-12"
          >
            {categories.map((category) => (
              <motion.article
                key={category.name}
                variants={softReveal}
                className={`group ui-card-lift relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_30px_70px_-35px_rgba(15,23,42,0.65)] ${category.layout}`}
              >
                <motion.img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  initial={{ opacity: 0, y: 24, scale: 0.94 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={viewportSettings}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
                <div className={`absolute inset-0 bg-gradient-to-b ${category.accent}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="relative flex min-h-[24rem] flex-col justify-end p-7 sm:min-h-[28rem] sm:p-8 lg:min-h-[33rem]">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-200">{category.name}</p>
                  <h3 className="mt-4 font-display text-3xl font-bold leading-tight text-white">{category.title}</h3>
                  <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-slate-200">{category.description}</p>
                  <Link
                    to={category.href}
                    className="ui-button-light relative z-20 mt-7 inline-flex w-fit items-center px-5 py-3 text-sm font-bold"
                  >
                    Explore {category.name}
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="trending" className="scroll-mt-28 bg-[linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,250,252,0.88))] py-20 sm:py-24">
        <div className="site-shell">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewportSettings}
              variants={revealUp}
              className="rounded-[2rem] border border-slate-200/10 bg-slate-950 p-8 text-white shadow-[0_28px_80px_-38px_rgba(15,23,42,0.8)]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">Trending Now</p>
              <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight">
                Momentum products shoppers keep coming back for.
              </h2>
              <p className="mt-5 text-sm font-medium leading-7 text-slate-300">
                These are the pairs earning repeat visits, quick saves, and fast carts thanks to
                their mix of all-day comfort and versatile styling.
              </p>

              <div className="mt-8 space-y-4">
                {trendingProducts.slice(0, 3).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                        0{index + 1}
                      </p>
                      <p className="mt-1 font-semibold text-white">{product.name}</p>
                    </div>
                    <p className="text-sm font-bold text-amber-300">{formatCurrency(product.price)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewportSettings}
              variants={staggerGrid}
              className="grid gap-6 sm:grid-cols-2"
            >
              {trendingProducts.map((product) => (
                <motion.div key={product.id} variants={softReveal}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {recentlyViewedProducts.length > 0 && (
        <section id="recently-viewed" className="scroll-mt-28 bg-slate-50 py-20 sm:py-24">
          <div className="site-shell">
            <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionIntro
                eyebrow="Recently Viewed"
                title="Pick up where you left off."
                description="The pairs you viewed recently are ready here, so returning to a product takes one glance instead of a search."
              />
              <Link
                to="/shop"
                className="ui-button-outline inline-flex items-center justify-center self-start px-6 py-3 text-sm font-bold"
              >
                Continue Browsing
              </Link>
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewportSettings}
              variants={staggerGrid}
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
            >
              {recentlyViewedProducts.map((product) => (
                <motion.div key={product.id} variants={softReveal}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <section id="brands" className="scroll-mt-28 bg-slate-950 py-20 text-white sm:py-24">
        <div className="site-shell">
          <SectionIntro
            eyebrow="Brand Showcase"
            title="Global names, curated through one premium lens."
            description="A focused edit from performance leaders and streetwear staples, presented with the clarity and pacing of a modern direct-to-consumer brand."
            theme="dark"
          />

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportSettings}
            variants={staggerGrid}
            className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5"
          >
            {brandShowcase.map((brand) => (
              <motion.article key={brand.name} variants={softReveal} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <p className="font-display text-2xl font-bold text-white">{brand.name}</p>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-300">{brand.note}</p>
                <div className="mt-6 h-px bg-white/10" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-amber-300">{brand.value}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="testimonials" className="scroll-mt-28 bg-white py-20 sm:py-24">
        <div className="site-shell">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro
              eyebrow="Testimonials"
              title="Customers notice the experience as much as the products."
              description="Premium layouts should still help people shop. These voices reflect the balance between brand presence, usability, and confidence."
            />
            <a
              href="#top"
              className="ui-button-outline inline-flex items-center justify-center self-start px-6 py-3 text-sm font-bold"
            >
              Back to Top
            </a>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportSettings}
            variants={staggerGrid}
            className="mt-12 grid gap-6 lg:grid-cols-3"
          >
            {testimonials.map((testimonial, index) => (
              <motion.article key={testimonial.name} variants={softReveal} className="rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-7 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white">
                    0{index + 1}
                  </span>
                  <div className="flex gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <span key={starIndex}>*</span>
                    ))}
                  </div>
                </div>
                <p className="mt-6 text-base font-medium leading-8 text-slate-700">
                  "{testimonial.quote}"
                </p>
                <div className="mt-8">
                  <p className="font-display text-xl font-bold text-slate-950">{testimonial.name}</p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {testimonial.role}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
