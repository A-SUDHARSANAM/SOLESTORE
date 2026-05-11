export const uploadImageToCloudinary = async (file) => {
  if (!file) return ''

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      console.error('[uploadImageToCloudinary] Upload failed', response.status, response.statusText)
      throw new Error('Cloudinary upload failed')
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('[uploadImageToCloudinary] Request failed', error)
    throw error
  }
}
