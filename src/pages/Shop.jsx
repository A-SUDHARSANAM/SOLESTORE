import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Filters from '../components/Filters'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'

const CATEGORY_OPTIONS = ['Formal', 'Casual', 'Sports', 'Sneakers']
const PAGE_SIZE = 4

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10">
      <div className="aspect-[4/3] w-full animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="flex items-center justify-between pt-4">
          <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

function Shop() {
  const { products, productsLoading, productsError } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.trim() ?? ''
  const normalizedSearch = searchQuery.toLowerCase()
  const categoryParam = searchParams.get('category')?.trim() ?? ''
  const normalizedCategory = categoryParam.toLowerCase()
  const [sortBy, setSortBy] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
    priceRange: [0, 5000],
  })

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [normalizedCategory, normalizedSearch])

  useEffect(() => {
    if (!categoryParam) {
      return
    }

    const matchingCategory = CATEGORY_OPTIONS.find(
      (option) => option.toLowerCase() === normalizedCategory,
    )

    if (!matchingCategory) {
      return
    }

    setSelectedFilters((prev) => {
      if (prev.categories.length === 1 && prev.categories[0] === matchingCategory) {
        return prev
      }

      return {
        ...prev,
        categories: [matchingCategory],
      }
    })
  }, [categoryParam, normalizedCategory])

  const brandOptions = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))],
    [products],
  )

  const sizeOptions = useMemo(
    () =>
      [...new Set(
        products.flatMap((product) =>
          (product.sizes ?? []).map((entry) => (typeof entry === 'object' ? entry.size : entry)),
        ),
      )]
        .filter((size) => size !== undefined && size !== null)
        .sort((a, b) => Number(a) - Number(b)),
    [products],
  )

  const toggleFilter = (group, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((entry) => entry !== value)
        : [...prev[group], value],
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({
      categories: [],
      brands: [],
      sizes: [],
      priceRange: [0, 5000],
    })
  }

  const filteredProducts = useMemo(() => {
    const matched = products.filter((product) => {
      const searchMatch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.brand.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch)

      const categoryMatch =
        selectedFilters.categories.length === 0 ||
        selectedFilters.categories.includes(product.category)

      const brandMatch =
        selectedFilters.brands.length === 0 ||
        selectedFilters.brands.includes(product.brand)

      const productSizes = (product.sizes ?? []).map((entry) =>
        typeof entry === 'object' && entry !== null ? entry.size : entry,
      )

      const sizeMatch =
        selectedFilters.sizes.length === 0 ||
        selectedFilters.sizes.some((size) => productSizes.includes(size))

      const priceMatch =
        product.price >= selectedFilters.priceRange[0] &&
        product.price <= selectedFilters.priceRange[1]

      return searchMatch && categoryMatch && brandMatch && sizeMatch && priceMatch
    })

    return [...matched].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      return Number(b.id) - Number(a.id)
    })
  }, [normalizedSearch, products, selectedFilters, sortBy])

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const canLoadMore = visibleCount < filteredProducts.length

  const handleFilterToggle = (group, value) => {
    if (group === 'categories' && categoryParam) {
      const params = new URLSearchParams(searchParams)
      params.delete('category')
      setSearchParams(params, { replace: true })
    }

    if (group === 'priceRange') {
      setSelectedFilters((prev) => ({ ...prev, priceRange: value }))
    } else {
      toggleFilter(group, value)
    }
    setVisibleCount(PAGE_SIZE)
  }

  const handleClearFilters = () => {
    clearFilters()
    if (categoryParam) {
      const params = new URLSearchParams(searchParams)
      params.delete('category')
      setSearchParams(params, { replace: true })
    }
    setVisibleCount(PAGE_SIZE)
  }

  const handleSearchChange = (event) => {
    const nextSearch = event.target.value
    const params = new URLSearchParams(searchParams)

    if (nextSearch.trim()) {
      params.set('q', nextSearch)
    } else {
      params.delete('q')
    }

    setSearchParams(params)
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <Link to="/" className="transition hover:text-ink">Home</Link>
          <span>&gt;</span>
          <span className="text-ink">Shop</span>
        </nav>
        <h1 className="section-heading">Shop</h1>
        <p className="text-sm font-medium text-slate-500">
          {categoryParam
            ? `${categoryParam} collection`
            : searchQuery
              ? `Search results for "${searchQuery}"`
              : 'Performance footwear and everyday icons.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Filters
          categoryOptions={CATEGORY_OPTIONS}
          brandOptions={brandOptions}
          sizeOptions={sizeOptions}
          selectedFilters={selectedFilters}
          onToggleFilter={handleFilterToggle}
          onClearFilters={handleClearFilters}
        />

        <section>
          {productsError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {productsError}
            </p>
          )}

          {productsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Showing {visibleProducts.length} of {filteredProducts.length} products
                </p>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search shoes..."
                  className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-medium outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:w-72"
                />
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  Sort
                  <select
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(event.target.value)
                      setVisibleCount(PAGE_SIZE)
                    }}
                    className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </label>
              </div>

              <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <div key={product.id} className="flex h-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {canLoadMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-500 hover:bg-slate-50"
                  >
                    Load More
                  </button>
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-xl font-bold text-slate-900">No products found</h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-slate-500">
                    We couldn't find anything matching {searchQuery ? `"${searchQuery}"` : "your filters"}. Try adjusting your search term or clearing some filters.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleClearFilters}
                      className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default Shop
