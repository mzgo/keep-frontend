/**
 * 前端图片压缩工具
 * 上传前压缩: 最长边 ≤ 1920px, JPEG 质量 0.75, 目标 < 500KB
 */

const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.75
const MAX_SIZE_BYTES = 500 * 1024

/**
 * 压缩图片文件
 * @param {File} file 原始图片文件
 * @returns {Promise<Blob>} 压缩后的 Blob
 */
export async function compressImage(file) {
  // 非图片文件直接返回
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }

  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  // 计算缩放尺寸
  let targetW = width
  let targetH = height
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
    targetW = Math.round(width * ratio)
    targetH = Math.round(height * ratio)
  }

  const canvas = new OffscreenCanvas(targetW, targetH)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, targetW, targetH)
  bitmap.close()

  let blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY })

  // 如果仍然过大，逐步降低质量
  let quality = JPEG_QUALITY
  while (blob.size > MAX_SIZE_BYTES && quality > 0.3) {
    quality -= 0.1
    blob = await canvas.convertToBlob({ type: 'image/jpeg', quality })
  }

  return blob
}

/**
 * File -> Base64 DataURL (用于预览)
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
