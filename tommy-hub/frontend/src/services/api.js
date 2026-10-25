import axios from 'axios'

   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('th_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('th_token')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const login = (username, password) =>
  api.post('/api/auth/login', { username, password }).then((r) => r.data)

export const lookupCustomer = (phone) =>
  api.get('/api/customers/lookup', { params: { phone } }).then((r) => r.data)

export const createCustomer = (name, phone) =>
  api.post('/api/customers', { name, phone }).then((r) => r.data)

export const listProducts = (category) =>
  api.get('/api/products', { params: category ? { category } : {} }).then((r) => r.data)

export const createBill = (payload) =>
  api.post('/api/bills', payload).then((r) => r.data)

export const getBill = (billNumber) =>
  api.get(`/api/bills/${billNumber}`).then((r) => r.data)

export const sendBillSms = (billNumber) =>
  api.post(`/api/bills/${billNumber}/sms`).then((r) => r.data)

export default api
