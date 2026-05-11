import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FiEdit2, FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import {
  addProduct,
  createProductId,
  deleteProduct,
  subscribeToProducts,
  updateProduct,
} from '../../services/productService'
import { uploadImageToCloudinary } from '../../services/cloudinaryService'
import { formatCurrency } from '../../lib/currency'

const EMPTY_FORM = {
  name: '',
  brand: '',
  category: '',
  price: '',
  originalPrice: '',
  stock: '',
  description: '',
  sizes: [],
  featured: false,
  trending: false,
  imageUrl: '',
}

const CATEGORY_OPTIONS = ['Formal', 'Casual', 'Sports', 'Sneakers']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sizeInput, setSizeInput] = useState('')
  const [stockInput, setStockInput] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return subscribeToProducts(setProducts, () => setProducts([]))
  }, [])

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('')
      return undefined
    }

    const nextPreview = URL.createObjectURL(imageFile)
    setPreviewUrl(nextPreview)

    return () => URL.revokeObjectURL(nextPreview)
  }, [imageFile])

  const totalStock = useMemo(() => {
    if (form.sizes.length) {
      return form.sizes.reduce((sum, entry) => sum + Number(entry.stock || 0), 0)
    }
    return Number(form.stock || 0)
  }, [form.sizes, form.stock])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleAddSize = () => {
    const sizeValue = sizeInput.trim()
    const stockValue = stockInput.trim()

    if (!sizeValue || !stockValue) return

    setForm((prev) => {
      const exists = prev.sizes.some((entry) => String(entry.size) === sizeValue)
      if (exists) return prev

      return {
        ...prev,
        sizes: [...prev.sizes, { size: sizeValue, stock: stockValue }],
      }
    })

    setSizeInput('')
    setStockInput('')
  }

  const handleRemoveSize = (sizeToRemove) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((entry) => String(entry.size) !== String(sizeToRemove)),
    }))
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setImageFile(null)
    setPreviewUrl('')
    setIsUploadingImage(false)
    setError('')
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const closeModal = () => {
    resetForm()
    setIsModalOpen(false)
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name ?? '',
      brand: product.brand ?? '',
      category: product.category ?? '',
      price: product.price ?? '',
      originalPrice: product.originalPrice ?? '',
      stock: product.stock ?? '',
      description: product.description ?? '',
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      featured: Boolean(product.featured),
      trending: Boolean(product.trending),
      imageUrl: product.imageUrl ?? product.image ?? '',
    })
    setImageFile(null)
    setPreviewUrl(product.imageUrl ?? product.image ?? '')
    setIsUploadingImage(false)
    setError('')
    setIsModalOpen(true)
  }

  const handleImageChange = (event) => {
    const nextFile = event.target.files?.[0] || null
    setImageFile(nextFile)
    setError('')
  }

  const handleDelete = async (productId) => {
    const confirmed = window.confirm('Delete this product? This cannot be undone.')
    if (!confirmed) return

    try {
      await deleteProduct(productId)
      toast.success('Product deleted.')
    } catch (err) {
      console.error('[AdminProducts] Delete failed', err)
      toast.error(err?.message || 'Unable to delete product.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim() || !form.brand.trim() || !form.category.trim()) {
      setError('Name, brand, and category are required.')
      return
    }

    if (!form.price) {
      setError('Price is required.')
      return
    }

    setSaving(true)

    try {
      const productId = editingId ?? createProductId()
      let imageUrl = form.imageUrl || ''

      if (imageFile) {
        setIsUploadingImage(true)

        try {
          imageUrl = await uploadImageToCloudinary(imageFile)
        } catch (uploadError) {
          console.error('[AdminProducts] Cloudinary upload failed', uploadError)
          throw new Error(uploadError?.message || 'Image upload failed. Please try again.')
        } finally {
          setIsUploadingImage(false)
        }
      }

      const normalizedSizes = form.sizes.map((entry) => ({
        size: Number(entry.size),
        stock: Number(entry.stock),
      }))
      const stockTotal = normalizedSizes.length
        ? normalizedSizes.reduce((sum, entry) => sum + Number(entry.stock || 0), 0)
        : Number(form.stock || 0)

      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: stockTotal,
        description: form.description.trim(),
        sizes: normalizedSizes,
        featured: Boolean(form.featured),
        trending: Boolean(form.trending),
        imageUrl,
      }

      if (editingId) {
        await updateProduct(productId, payload)
        toast.success('Product updated.')
      } else {
        await addProduct(productId, payload)
        toast.success('Product added.')
      }

      closeModal()
    } catch (err) {
      const message = err?.message || 'Unable to save product.'
      console.error('[AdminProducts] Save failed', err)
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
      setIsUploadingImage(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Catalog</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Products</h1>
          <p className="mt-2 text-sm text-slate-600">Add, update, and organize your footwear catalog.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
        >
          <FiPlus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="transition hover:bg-slate-50/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.imageUrl || product.image}
                        alt={product.name}
                        className="h-14 w-20 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(product.price || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.stock ?? 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="border-t border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            <p>No products yet. Add your first shoe to the catalog.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              <FiPlus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 px-4 py-8">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit product' : 'Add new product'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Close"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-4 overflow-y-auto p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Product name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Air Glide Runner"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Brand
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Step_outs"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Category
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Price
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="1899"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Original price (optional)
                  <input
                    type="number"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="2399"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Stock
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Total stock"
                  />
                </label>
              </div>

              <label className="text-sm font-semibold text-slate-700">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Lightweight, breathable, and built for city runs."
                />
              </label>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Sizes & stock</p>
                <div className="flex flex-wrap gap-2">
                  {form.sizes.map((entry) => (
                    <span key={entry.size} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Size {entry.size} · {entry.stock}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(entry.size)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {form.sizes.length === 0 && (
                    <span className="text-xs text-slate-400">No sizes added yet.</span>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={sizeInput}
                    onChange={(event) => setSizeInput(event.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Size"
                  />
                  <input
                    value={stockInput}
                    onChange={(event) => setStockInput(event.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Stock"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <FiPlus className="h-4 w-4" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-slate-500">Total stock: {totalStock}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    className="h-4 w-4 accent-slate-900"
                  />
                  Featured product
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    name="trending"
                    checked={form.trending}
                    onChange={handleChange}
                    className="h-4 w-4 accent-slate-900"
                  />
                  Trending product
                </label>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">
                  Product image
                  <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 px-4 py-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm"
                    />
                    {(previewUrl || form.imageUrl) && (
                      <img
                        src={previewUrl || form.imageUrl}
                        alt="Preview"
                        className="h-32 w-full rounded-xl object-cover"
                      />
                    )}
                    {isUploadingImage && (
                      <div className="text-xs font-semibold text-slate-500">
                        Uploading image to Cloudinary...
                      </div>
                    )}
                  </div>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Or paste image URL
                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="https://..."
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <FiUpload className="h-4 w-4" />
                  {saving ? 'Saving...' : editingId ? 'Update product' : 'Add product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
