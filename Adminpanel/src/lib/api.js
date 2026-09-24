const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const ACCESS_KEY = 'horizoninvest-admin-access-token'
const REFRESH_KEY = 'horizoninvest-admin-refresh-token'

let accessToken = localStorage.getItem(ACCESS_KEY) || ''
let refreshToken = localStorage.getItem(REFRESH_KEY) || ''
let refreshPromise = null

export function getAccessToken() {
  return accessToken
}

export function setTokens(nextAccessToken, nextRefreshToken = refreshToken) {
  accessToken = nextAccessToken || ''
  refreshToken = nextRefreshToken || ''
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  else localStorage.removeItem(ACCESS_KEY)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  else localStorage.removeItem(REFRESH_KEY)
}

export function clearTokens() {
  setTokens('', '')
}

async function refreshAccessToken() {
  if (!refreshToken) throw new Error('Session expired. Please login again.')

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}))
        if (!res.ok || !payload?.data?.accessToken) {
          throw new Error(payload?.message || 'Session expired. Please login again.')
        }
        setTokens(payload.data.accessToken, refreshToken)
        return payload.data.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

async function request(path, { method = 'GET', body } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  const payload = await res.json().catch(() => ({}))
  return { res, payload }
}

export async function apiRequest(path, { method = 'GET', body, _retry = true } = {}) {
  const { res, payload } = await request(path, { method, body })
  if (res.ok) return payload

  if (res.status === 401 && _retry && path !== '/auth/refresh') {
    try {
      await refreshAccessToken()
      const retry = await request(path, { method, body })
      if (retry.res.ok) return retry.payload
      throw new Error(retry.payload?.message || `Request failed (${retry.res.status})`)
    } catch (error) {
      clearTokens()
      throw error
    }
  }

  if (res.status === 403 && String(payload?.message || '').toLowerCase().includes('blocked')) {
    clearTokens()
  }

  throw new Error(payload?.message || `Request failed (${res.status})`)
}

export { API_BASE }
