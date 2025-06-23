
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'userAccessToken'
const REFRESH_TOKEN_KEY = 'userRefreshToken'

export async function saveTokens(tokens: { accessToken: string; refreshToken: string }) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken)
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
}

export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
}

const api = axios.create({
  baseURL: 'http://192.168.1.187/api',
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
type QueueItem = { resolve: (token: string) => void; reject: (err: any) => void }
let failedQueue: QueueItem[] = []

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

api.interceptors.request.use(
  async config => {
    const token = await getAccessToken()
    console.log(`Using token: ${token}`);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  err => Promise.reject(err)
)

api.interceptors.response.use(
  res => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as AxiosRequestConfig & { _retry?: boolean }
    if (err.response?.status === 401 || err.response?.status === 403 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            if (originalRequest.headers)
              originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = await getRefreshToken()
      if (!refreshToken) {
        await clearTokens()
        return Promise.reject(err)
      }

      try {
        const { data } = await axios.post(
          'http://192.168.1.187/api/auth/refresh_token',
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )
        const { accessToken, refreshToken: newRefresh } = data as {
          accessToken: string
          refreshToken: string
        }

        await saveTokens({ accessToken, refreshToken: newRefresh })
        api.defaults.headers.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)

        if (originalRequest.headers)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        await clearTokens()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
