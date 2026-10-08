const values = import.meta.env
let baseURL = values.VITE_API_BASE_URL || ''
// #ifdef H5
baseURL = values.VITE_H5_API_BASE_URL || baseURL
// #endif

export const env = Object.freeze({
  title: values.VITE_APP_TITLE || 'SUGARGOO',
  baseURL: baseURL.replace(/\/$/, ''),
  timeout: Number(values.VITE_REQUEST_TIMEOUT) > 0 ? Number(values.VITE_REQUEST_TIMEOUT) : 15000,
})
