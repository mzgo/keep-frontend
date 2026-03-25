import request from '@/utils/request'

/**
 * 获取七牛云上传凭证
 */
export function getUploadToken(type = 'checkin') {
  return request.get('/upload/token', { params: { type } })
}

/**
 * 上传文件到七牛云
 * @param {Blob} file 文件
 * @param {string} token 上传凭证
 * @param {string} key 文件key
 */
export async function uploadToQiniu(file, token, key) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('token', token)
  formData.append('key', key)

  const response = await fetch('https://up.qiniup.com', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('图片上传失败')
  }
  return response.json()
}

/**
 * 通知后端已上传完成，获取签名访问URL
 */
export function confirmUpload(data) {
  return request.post('/upload/confirm', data)
}

export function getSignedUrl(key) {
  return request.get('/upload/url', { params: { key } })
}
