import { useMemo, useState } from 'react'

function Filters({
  categoryOptions,
  brandOptions,
  sizeOptions,
  selectedFilters,
  onToggleFilter,
  onClearFilters,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFilterCount = useMemo(() => {
    let count =
      selectedFilters.categories.length +
      selectedFilters.brands.length +
      selectedFilters.sizes.length

    if (selectedFilters.priceRange[0] !== 0 || selectedFilters.priceRange[1] !== 5000) {
      count += 1
    }

    return count
  }, [
    selectedFilters.brands.length,
    selectedFilters.categories.length,
    selectedFilters.sizes.length,
    selectedFilters.priceRange,
  ])

  return (
    <aside className="lg:sticky lg:top-24">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 shadow-sm lg:hidden"
      >
        <span>Filters</span>
        <span className="rounded-full bg-ink px-2 py-1 text-xs text-white">
          {activeFilterCount}
        </span>
      </button>

      <div
        className={`space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-premium ${
          isOpen ? 'block' : 'hidden'
        } lg:block`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClearFilters}
            disabled={activeFilterCount === 0}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear All
          </button>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-slate-800 uppercase tracking-wider">Category</p>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => {
              const selected = selectedFilters.categories.includes(category)

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onToggleFilter('categories', category)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    selected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </div>

        {brandOptions.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-bold text-slate-800 uppercase tracking-wider">Brand</p>
          <div className="space-y-2.5 text-sm text-slate-600">
            {brandOptions.map((brand) => {
              const selected = selectedFilters.brands.includes(brand)

              return (
                <label
                  key={brand}
                  className="group flex cursor-pointer items-center gap-3 transition-colors"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleFilter('brands', brand)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 transition-all checked:border-slate-900 checked:bg-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    />
                    <svg
                      className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className={`font-semibold transition-colors ${selected ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    {brand}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
        )}

        {sizeOptions.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-bold text-slate-800 uppercase tracking-wider">Size</p>
          <div className="grid grid-cols-4 gap-2">
            {sizeOptions.map((size) => {
              const selected = selectedFilters.sizes.includes(size)
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onToggleFilter('sizes', size)}
                  className={`flex h-10 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-200 ${
                    selected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">Price Range</p>
            <span className="text-xs font-bold text-slate-500">
              ₹{selectedFilters.priceRange[0]} - ₹{selectedFilters.priceRange[1]}
            </span>
          </div>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="5000"
              step="500"
              value={selectedFilters.priceRange[1]}
              onChange={(e) => onToggleFilter('priceRange', [0, parseInt(e.target.value, 10)])}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              style={{
                background: `linear-gradient(to right, #0f172a ${(selectedFilters.priceRange[1] / 5000) * 100}%, #e2e8f0 ${(selectedFilters.priceRange[1] / 5000) * 100}%)`,
              }}
            />
            <div className="mt-2 flex justify-between text-xs font-bold text-slate-400">
              <span>₹0</span>
              <span>₹5000</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Filters
