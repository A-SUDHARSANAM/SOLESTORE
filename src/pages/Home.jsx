import {
  motion,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiPhoneCall } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import GlassCard from '../components/GlassCard'
import GradientBackground from '../components/GradientBackground'
import fallbackShoe from '../assets/fallback-shoe.svg'
import { useStoreSettings } from '../context/StoreSettingsContext'
import { useProducts } from '../context/ProductContext'
import { formatCurrency } from '../lib/currency'
import { REVIEWS_STORAGE_KEY, getReviews } from '../lib/reviews'

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

function CategoryCard({ category }) {
  return (
    <GlassCard
      as={motion.article}
      variants={softReveal}
      className="group overflow-hidden rounded-2xl hover:-translate-y-1 hover:shadow-xl"
    >
      <Link to={category.href} className="block h-full">
        <div className="m-3 aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-white to-amber-50">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">{category.name}</p>
          <h3 className="mt-2 font-display text-xl font-extrabold leading-tight text-slate-950">
            {category.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
          <span className="mt-5 inline-flex rounded-full bg-gradient-to-r from-slate-950 to-amber-700 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Shop {category.name}
          </span>
        </div>
      </Link>
    </GlassCard>
  )
}

function Home() {
  const { products, productsLoading, productsError, getRecentlyViewedProducts } = useProducts()
  const { storeSettings } = useStoreSettings()
  const [activeHeroIndex, setActiveHeroIndex] = useState(0)

  const featuredSelections = products.filter((product) => product.featured)
  const featuredProducts = (featuredSelections.length ? featuredSelections : products).slice(0, 4)
  const trendingSelections = products.filter((product) => product.trending)
  const trendingProducts = (trendingSelections.length
    ? trendingSelections
    : [...products].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
  ).slice(0, 4)
  const heroSlides = (() => {
    const seen = new Set()
    const pool = [...featuredSelections, ...trendingSelections, ...products]
      .filter((product) => {
        if (!product) return false
        const id = String(product.id ?? '')
        if (!id || seen.has(id)) return false
        seen.add(id)
        return true
      })
      .slice(0, 4)

    if (pool.length) {
      return pool.map((product, index) => ({
        id: `hero-${product.id}`,
        name: product.name ?? 'Signature Pair',
        description:
          product.description ??
          'An elevated everyday sneaker built for comfort, clean lines, and confident movement.',
        price: product.price,
        image: product.imageUrl || product.image || product.images?.[0] || fallbackShoe,
        eyebrow: index === 0 ? 'New Season' : 'Featured Drop',
        tag: product.category || 'Premium',
        subtitle: product.brand ? `${product.brand} edition` : 'Curated performance and street icons',
      }))
    }

    return [
      {
        id: 'hero-fallback-1',
        name: `${storeSettings.name} Select`,
        description: 'A premium everyday sneaker with a clean silhouette and all-day cushioning.',
        price: 1499,
        image: fallbackShoe,
        eyebrow: 'New Season',
        tag: 'Premium',
        subtitle: 'Curated performance and street icons',
      },
      {
        id: 'hero-fallback-2',
        name: 'City Glide Runner',
        description: 'Lightweight uppers with a cushioned ride built for long urban days.',
        price: 1299,
        image: fallbackShoe,
        eyebrow: 'Featured Drop',
        tag: 'Lifestyle',
        subtitle: 'City-ready essentials',
      },
      {
        id: 'hero-fallback-3',
        name: 'Momentum Street Pro',
        description: 'Bold traction and breathable comfort for performance-driven routines.',
        price: 1599,
        image: fallbackShoe,
        eyebrow: 'Performance',
        tag: 'Sports',
        subtitle: 'Built for high-output days',
      },
    ]
  })()
  const activeHero = heroSlides[activeHeroIndex] ?? heroSlides[0]
  const heroImage = activeHero?.image || fallbackShoe
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    `${storeSettings.address} ${storeSettings.pincode}`,
  )}&output=embed`

  const recentlyViewedProducts = getRecentlyViewedProducts(4)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [testimonialItems, setTestimonialItems] = useState([])

  const categories = [
    {
      name: 'Formal',
      title: 'Sharp silhouettes for office hours and dressed-up evenings.',
      description:
        'Polished textures, refined comfort, and versatile pairs that hold their own from weekday meetings to weekend events.',
      image:
        products.find((product) => product.category === 'Formal')?.imageUrl ||
        products.find((product) => product.category === 'Formal')?.image ||
        heroImage,
      href: '/shop?category=Formal',
    },
    {
      name: 'Casual',
      title: 'Relaxed essentials built for everyday movement.',
      description:
        'Soft cushioning, lightweight uppers, and effortless styling for long city days, easy travel, and off-duty looks.',
      image:
        products.find((product) => product.category === 'Casual')?.imageUrl ||
        products.find((product) => product.category === 'Casual')?.image ||
        heroImage,
      href: '/shop?category=Casual',
    },
    {
      name: 'Sports',
      title: 'Performance-first footwear engineered to keep pace.',
      description:
        'Breathable construction, responsive support, and bold energy for training sessions, fast runs, and high-output routines.',
      image:
        products.find((product) => product.category === 'Sports')?.imageUrl ||
        products.find((product) => product.category === 'Sports')?.image ||
        heroImage,
      href: '/shop?category=Sports',
    },
  ]

  const brandShowcase = [
    { name: 'Nike', note: 'Air-driven icons', value: '24 drops' },
    { name: 'Adidas', note: 'Street and training hybrids', value: '18 drops' },
    { name: 'Puma', note: 'Bold retro energy', value: '12 drops' },
    { name: 'New Balance', note: 'Comfort-led classics', value: '15 drops' },
    { name: 'Skechers', note: 'Everyday ease', value: '10 drops' },
  ]

  const buildTestimonialItems = () => {
    const allReviews = getReviews()
    const flattened = Object.entries(allReviews).flatMap(([productId, reviews]) => {
      const product = products.find((item) => String(item.id) === String(productId))
      const productName = product?.name ?? 'Selected product'

      if (!Array.isArray(reviews)) return []

      return reviews
        .filter((review) => review?.comment && Number(review?.rating) >= 4)
        .map((review, index) => ({
          id: `${productId}-${review.date ?? 'na'}-${index}`,
          name: review.user ?? 'Guest',
          role: 'Verified Buyer',
          product: productName,
          quote: review.comment,
          rating: Number(review.rating || 0),
          verified: review.verified !== false,
          date: review.date ?? '',
        }))
    })

    return flattened
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      })
      .slice(0, 6)
  }

  useEffect(() => {
    setTestimonialItems(buildTestimonialItems())
  }, [products])

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined

    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroSlides.length)
    }, 6200)

    return () => window.clearInterval(intervalId)
  }, [heroSlides.length])

  useEffect(() => {
    if (activeHeroIndex >= heroSlides.length) {
      setActiveHeroIndex(0)
    }
  }, [activeHeroIndex, heroSlides.length])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleReviewUpdate = () => {
      setTestimonialItems(buildTestimonialItems())
    }
    const handleStorage = (event) => {
      if (event.key === REVIEWS_STORAGE_KEY) {
        handleReviewUpdate()
      }
    }

    window.addEventListener('reviews:updated', handleReviewUpdate)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('reviews:updated', handleReviewUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [products])

  const fallbackTestimonials = [
    {
      id: 'empty-reviews',
      name: storeSettings.name,
      role: 'Customer Reviews',
      product: activeHero?.name ?? 'Signature Pair',
      quote: 'No reviews yet. Be the first to review!',
      verified: false,
      rating: 0,
    },
  ]

  const displayTestimonials = testimonialItems.length
    ? testimonialItems
    : fallbackTestimonials

  const totalTestimonials = displayTestimonials.length

  const handlePrevHero = () => {
    if (heroSlides.length <= 1) return
    setActiveHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const handleNextHero = () => {
    if (heroSlides.length <= 1) return
    setActiveHeroIndex((prev) => (prev + 1) % heroSlides.length)
  }

  useEffect(() => {
    if (totalTestimonials <= 1) return undefined

    const intervalId = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % totalTestimonials)
    }, 3500)

    return () => window.clearInterval(intervalId)
  }, [totalTestimonials])

  useEffect(() => {
    if (activeTestimonial >= totalTestimonials) {
      setActiveTestimonial(0)
    }
  }, [activeTestimonial, totalTestimonials])

  const handlePrevTestimonial = () => {
    if (totalTestimonials <= 1) return
    setActiveTestimonial((prev) => (prev - 1 + totalTestimonials) % totalTestimonials)
  }

  const handleNextTestimonial = () => {
    if (totalTestimonials <= 1) return
    setActiveTestimonial((prev) => (prev + 1) % totalTestimonials)
  }

  return (
    <GradientBackground id="top">
      <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,_rgba(5,11,37,0.06)_0%,_transparent_32%,_rgba(245,158,11,0.1)_72%,_transparent_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <div className="site-shell">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerGrid}
            className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] lg:items-center"
          >
            <GlassCard className="rounded-[2rem] p-6 sm:p-8 lg:p-10">
              <motion.p variants={softReveal} className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600">
                {activeHero?.eyebrow ?? 'New Season'}
              </motion.p>
              <motion.h1 variants={revealUp} className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Step into simple, comfortable footwear.
              </motion.h1>
              <motion.p variants={softReveal} className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Shop formal, casual, and sports shoes with a clean layout that is easy to browse on any device.
              </motion.p>
              <motion.div variants={softReveal} className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/shop" className="ui-button-primary inline-flex justify-center px-6 py-3 text-sm font-bold shadow-lg shadow-amber-900/10">
                  Shop Now
                </Link>
                <a href="#categories" className="ui-button-outline inline-flex justify-center px-6 py-3 text-sm font-bold">
                  Browse Categories
                </a>
              </motion.div>
            </GlassCard>

            <GlassCard as={motion.div} variants={softReveal} className="overflow-hidden rounded-2xl">
              <div className="m-3 aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-white to-amber-50">
                <img src={heroImage} alt={activeHero?.name ?? 'Featured shoe'} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col gap-3 border-t border-white/30 bg-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-950">{activeHero?.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {activeHero?.price ? formatCurrency(activeHero.price) : activeHero?.tag}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handlePrevHero} className="h-9 rounded-full border border-white/30 bg-white/30 px-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-[18px] transition duration-300 hover:bg-white/55">
                    Prev
                  </button>
                  <button type="button" onClick={handleNextHero} className="h-9 rounded-full border border-white/30 bg-white/30 px-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-[18px] transition duration-300 hover:bg-white/55">
                    Next
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section id="featured" className="scroll-mt-28 py-16 sm:py-20">
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

      <section id="categories" className="scroll-mt-28 py-12 sm:py-16">
        <div className="site-shell">
          <SectionIntro
            eyebrow="Categories"
            title="Shop by category."
            description="Choose what you need quickly: formal shoes, daily casual pairs, or sports footwear."
          />

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportSettings}
            variants={staggerGrid}
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </motion.div>
        </div>
      </section>

      <section id="trending" className="scroll-mt-28 py-20 sm:py-24">
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
        <section id="recently-viewed" className="scroll-mt-28 py-20 sm:py-24">
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

      <section id="brands" className="scroll-mt-28 bg-[#050b25]/95 py-20 text-white sm:py-24">
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
              <motion.article key={brand.name} variants={softReveal} className="glass-panel rounded-[1.75rem] p-6">
                <p className="font-display text-2xl font-bold text-white">{brand.name}</p>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-300">{brand.note}</p>
                <div className="mt-6 h-px bg-white/10" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-amber-300">{brand.value}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-28 py-20 sm:py-24">
        <div className="site-shell">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div className="space-y-8">
              <SectionIntro
                eyebrow="Contact Us"
                title={`Visit ${storeSettings.name} or call for assistance.`}
                description="Reach our team for sizing, delivery details, or pickup guidance."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <GlassCard className="rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <FiMapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Store address</p>
                      <p className="mt-2 text-sm text-slate-600">{storeSettings.address}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">Pincode: {storeSettings.pincode}</p>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <FiPhoneCall className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Call us</p>
                      <a href={`tel:${storeSettings.phone}`} className="mt-2 block text-sm font-medium text-slate-600 transition hover:text-slate-900">
                        {storeSettings.phone}
                      </a>
                      <a href={`tel:${storeSettings.alternate}`} className="mt-1 block text-sm font-medium text-slate-600 transition hover:text-slate-900">
                        {storeSettings.alternate}
                      </a>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            <GlassCard className="overflow-hidden rounded-[2rem]">
              <iframe
                title={`${storeSettings.name} map`}
                src={mapSrc}
                className="h-80 w-full sm:h-[22rem] lg:h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </GlassCard>
          </div>
        </div>
      </section>

      <section id="testimonials" className="scroll-mt-28 py-20 sm:py-24">
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

          <div className="relative mt-12">
            <button
              type="button"
              onClick={handlePrevTestimonial}
              className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/30 text-xl font-bold text-slate-700 shadow-md backdrop-blur-[18px] transition duration-300 hover:scale-[1.03] hover:bg-white/55 sm:flex"
              aria-label="Previous testimonial"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={handleNextTestimonial}
              className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/30 text-xl font-bold text-slate-700 shadow-md backdrop-blur-[18px] transition duration-300 hover:scale-[1.03] hover:bg-white/55 sm:flex"
              aria-label="Next testimonial"
            >
              &#8250;
            </button>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {displayTestimonials.map((testimonial, index) => (
                  <div key={testimonial.id ?? `${testimonial.name}-${index}`} className="w-full shrink-0 px-1 sm:px-8">
                    <GlassCard
                      as={motion.article}
                      initial="hidden"
                      whileInView="show"
                      viewport={viewportSettings}
                      variants={softReveal}
                      className="group rounded-[2rem] p-7 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white">
                          0{index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {testimonial.verified && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                              Verified Purchase
                            </span>
                          )}
                          {testimonial.rating > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1 text-amber-500">
                                {Array.from({ length: 5 }).map((_, starIndex) => (
                                  <span key={starIndex}>
                                    {starIndex < Math.round(testimonial.rating) ? '\u2605' : '\u2606'}
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs font-semibold text-slate-600">
                                {testimonial.rating.toFixed(1)}/5
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-500">
                              No ratings yet
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-6 text-base font-medium leading-8 text-slate-700">
                        "{testimonial.quote}"
                      </p>
                      <div className="mt-8 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold uppercase tracking-[0.2em] text-white">
                          {testimonial.name?.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-display text-xl font-bold text-slate-950">{testimonial.name}</p>
                          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                            {testimonial.role}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-amber-700">{testimonial.product}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {displayTestimonials.map((_, index) => (
              <button
                key={`testimonial-dot-${index}`}
                type="button"
                onClick={() => setActiveTestimonial(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === activeTestimonial
                    ? 'bg-slate-900'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </GradientBackground>
  )
}

export default Home
