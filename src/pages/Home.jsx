import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMapPin, FiPhoneCall } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
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

const luxeCardReveal = {
  hidden: { opacity: 0, y: 48, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const luxeTextReveal = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const luxeWordStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

const luxeWordReveal = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
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

function CategoryCard({ category, index }) {
  const cardRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)
  const rotateXSpring = useSpring(rotateX, { stiffness: 120, damping: 18, mass: 0.4 })
  const rotateYSpring = useSpring(rotateY, { stiffness: 120, damping: 18, mass: 0.4 })
  const glowXSpring = useSpring(glowX, { stiffness: 80, damping: 20, mass: 0.3 })
  const glowYSpring = useSpring(glowY, { stiffness: 80, damping: 20, mass: 0.3 })
  const imageX = useTransform(rotateYSpring, [-10, 10], [-12, 12])
  const imageY = useTransform(rotateXSpring, [-10, 10], [10, -10])
  const glow = useMotionTemplate`radial-gradient(circle at ${glowXSpring}% ${glowYSpring}%, rgba(255,255,255,0.35), transparent 48%)`
  const titleWords = category.title.split(' ')
  const idleAnimation = prefersReducedMotion
    ? {}
    : {
        y: [0, -8, 0],
        rotateZ: [0, 0.6, 0],
      }
  const idleTransition = prefersReducedMotion
    ? {}
    : {
        duration: 8 + index,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: index * 0.6,
      }

  const handleMouseMove = (event) => {
    if (!cardRef.current || prefersReducedMotion) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const xPercent = (x / rect.width) * 100
    const yPercent = (y / rect.height) * 100
    const rotateXValue = ((y - rect.height / 2) / rect.height) * -12
    const rotateYValue = ((x - rect.width / 2) / rect.width) * 12

    rotateX.set(rotateXValue)
    rotateY.set(rotateYValue)
    glowX.set(xPercent)
    glowY.set(yPercent)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    glowX.set(50)
    glowY.set(50)
  }

  return (
    <motion.article
      ref={cardRef}
      variants={luxeCardReveal}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={idleAnimation}
      transition={idleTransition}
      whileHover={{ y: -18, scale: 1.03, rotateX: 3, rotateY: -3 }}
      style={{ rotateX: rotateXSpring, rotateY: rotateYSpring, transformStyle: 'preserve-3d' }}
      className={`group relative overflow-hidden rounded-[2.6rem] border border-white/20 bg-slate-950 text-white shadow-[0_45px_120px_-70px_rgba(15,23,42,0.9)] ring-1 ring-white/10 transition-all duration-500 hover:z-10 hover:border-white/35 hover:shadow-[0_70px_150px_-65px_rgba(15,23,42,0.95)] ${category.layout} transform-gpu`}
    >
      <motion.div
        className="absolute inset-0 opacity-70"
        style={{ backgroundImage: glow }}
      />
      <motion.img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-110"
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={viewportSettings}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        animate={prefersReducedMotion ? undefined : { scale: [1.04, 1.1, 1.04] }}
        style={{ x: imageX, y: imageY }}
      />
      <motion.div
        className="absolute inset-0"
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [0.3, 0.55, 0.3] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }
        style={{
          backgroundImage:
            'linear-gradient(120deg, rgba(255,255,255,0.18), transparent 55%, rgba(255,255,255,0.08))',
          backgroundSize: '200% 200%',
        }}
      />
      <div className={`absolute inset-0 bg-gradient-to-b ${category.accent} opacity-70 transition-opacity duration-500 group-hover:opacity-85`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(251,191,36,0.24),_transparent_40%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,_rgba(255,255,255,0.18),_transparent_40%)] opacity-80" />
      <div className="absolute inset-0 rounded-[2.6rem] border border-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-3 rounded-[2rem] border border-white/10 bg-white/5 opacity-0 backdrop-blur-[2px] transition-opacity duration-500 group-hover:opacity-100" />

      {[0, 1, 2, 3, 4].map((particle) => (
        <motion.span
          key={`${category.name}-particle-${particle}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/70"
          style={{
            left: `${18 + particle * 16}%`,
            top: `${20 + particle * 10}%`,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [0, -12, 0],
                  opacity: [0.3, 0.8, 0.3],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 5 + particle,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: particle * 0.6,
                }
          }
        />
      ))}

      <div className="relative flex min-h-[24rem] flex-col justify-end p-7 sm:min-h-[28rem] sm:p-8 lg:min-h-[33rem]">
        <motion.div
          variants={luxeTextReveal}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.35)] backdrop-blur"
          animate={
            prefersReducedMotion
              ? undefined
              : { boxShadow: ['0 0 12px rgba(251,191,36,0.2)', '0 0 26px rgba(251,191,36,0.55)', '0 0 12px rgba(251,191,36,0.2)'] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {category.name}
        </motion.div>
        <motion.h3
          variants={luxeWordStagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportSettings}
          className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl"
        >
          {titleWords.map((word, wordIndex) => (
            <motion.span
              key={`${category.name}-word-${wordIndex}`}
              variants={luxeWordReveal}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </motion.h3>
        <motion.p
          variants={luxeTextReveal}
          className="mt-4 max-w-sm text-sm font-medium leading-7 text-slate-200"
        >
          {category.description}
        </motion.p>
        <motion.div variants={luxeTextReveal} className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to={category.href}
            className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white shadow-[0_18px_40px_-22px_rgba(255,255,255,0.75)] backdrop-blur transition-all duration-300 hover:scale-[1.03] hover:border-white/40 hover:bg-white/20"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/40 via-white/10 to-transparent transition-transform duration-500 group-hover/cta:translate-x-0" />
            <span className="absolute inset-0 scale-0 rounded-full bg-white/20 opacity-0 transition-all duration-300 group-active/cta:scale-100 group-active/cta:opacity-100" />
            <span className="relative">Explore {category.name}</span>
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover/cta:translate-x-1 group-active/cta:scale-110">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
          <Link
            to={category.href}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition-all duration-300 hover:text-white"
          >
            Shop now
          </Link>
        </motion.div>
      </div>
    </motion.article>
  )
}

function Home() {
  const { products, productsLoading, productsError, getRecentlyViewedProducts } = useProducts()
  const { storeSettings } = useStoreSettings()
  const heroRef = useRef(null)
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
      accent: 'from-slate-950/92 via-slate-900/48 to-transparent',
      layout: 'lg:col-span-5',
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
      accent: 'from-amber-900/88 via-amber-600/32 to-transparent',
      layout: 'lg:col-span-3',
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
    <div id="top" className="bg-transparent">
      <section ref={heroRef} className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-white">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeHero?.id}
            src={heroImage}
            alt={activeHero?.name ?? 'Hero shoe'}
            className="absolute inset-0 h-[112%] w-full object-cover will-change-transform"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: heroParallaxY }}
          />
        </AnimatePresence>
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
                {activeHero?.eyebrow ?? 'New Season'}
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {activeHero?.subtitle ?? 'Curated performance and street icons'}
              </motion.div>

              <motion.h1 variants={revealUp} className="mt-7 max-w-4xl font-display text-6xl font-extrabold leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-[7.5rem]">
                Step Into Style
              </motion.h1>

              <motion.p variants={softReveal} className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-200 sm:text-lg">
                {activeHero?.description ??
                  'Discover premium sneakers and everyday essentials designed to move with confidence, comfort, and bold visual energy.'}
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

              <motion.div variants={softReveal} className="mt-10 flex flex-wrap items-center gap-3">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveHeroIndex(index)}
                    className={`group relative h-12 w-12 overflow-hidden rounded-full border transition-all duration-300 ${
                      index === activeHeroIndex
                        ? 'border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.55)]'
                        : 'border-white/20 hover:border-white/50'
                    }`}
                    aria-label={`View ${slide.name}`}
                  >
                    <img
                      src={slide.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </button>
                ))}
              </motion.div>
            </div>

            <motion.div variants={softReveal} className="flex items-end lg:justify-end">
              <div className="ui-card-lift w-full max-w-xs rounded-[2rem] border border-white/12 bg-white/10 p-5 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Featured Drop</p>
                <p className="mt-3 font-display text-3xl font-bold text-white">{activeHero?.name}</p>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-300">{activeHero?.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Starting at</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {activeHero?.price ? formatCurrency(activeHero.price) : ''}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white">
                    {activeHero?.tag ?? 'Premium'}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  <button
                    type="button"
                    onClick={handlePrevHero}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/30 hover:bg-white/10"
                  >
                    Prev
                  </button>
                  <span>
                    {activeHeroIndex + 1} / {heroSlides.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextHero}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/30 hover:bg-white/10"
                  >
                    Next
                  </button>
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
            {categories.map((category, index) => (
              <CategoryCard key={category.name} category={category} index={index} />
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

      <section id="contact" className="scroll-mt-28 bg-slate-50 py-20 sm:py-24">
        <div className="site-shell">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div className="space-y-8">
              <SectionIntro
                eyebrow="Contact Us"
                title={`Visit ${storeSettings.name} or call for assistance.`}
                description="Reach our team for sizing, delivery details, or pickup guidance."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-premium">
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
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-premium">
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
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-premium">
              <iframe
                title={`${storeSettings.name} map`}
                src={mapSrc}
                className="h-80 w-full sm:h-[22rem] lg:h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
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

          <div className="relative mt-12">
            <button
              type="button"
              onClick={handlePrevTestimonial}
              className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-md transition hover:scale-[1.03] hover:bg-slate-50 sm:flex"
              aria-label="Previous testimonial"
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={handleNextTestimonial}
              className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-md transition hover:scale-[1.03] hover:bg-slate-50 sm:flex"
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
                    <motion.article
                      initial="hidden"
                      whileInView="show"
                      viewport={viewportSettings}
                      variants={softReveal}
                      className="group rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
                    </motion.article>
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
    </div>
  )
}

export default Home
