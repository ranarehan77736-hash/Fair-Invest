const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

let accessToken = localStorage.getItem('horizoninvest-access-token') || ''
let refreshToken = localStorage.getItem('horizoninvest-refresh-token') || ''
let refreshPromise = null

function setTokens(nextAccessToken, nextRefreshToken = refreshToken) {
  accessToken = nextAccessToken || ''
  refreshToken = nextRefreshToken || ''

  if (accessToken) localStorage.setItem('horizoninvest-access-token', accessToken)
  else localStorage.removeItem('horizoninvest-access-token')

  if (refreshToken) localStorage.setItem('horizoninvest-refresh-token', refreshToken)
  else localStorage.removeItem('horizoninvest-refresh-token')
}

function clearTokens() {
  setTokens('', '')
}

function getAccessToken() {
  return accessToken
}

function shouldAttemptRefresh(path) {
  if (!refreshToken) return false
  return ![
    '/auth/login',
    '/auth/register',
    '/auth/send-otp',
    '/auth/signup-config',
    '/auth/refresh',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].includes(path)
}

async function refreshAccessToken() {
  if (!refreshToken) throw new Error('No refresh token')
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload?.data?.accessToken) {
      throw new Error(payload?.message || `Refresh failed (${response.status})`)
    }
    setTokens(payload.data.accessToken, refreshToken)
    return payload.data.accessToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

function handleMockRequest(path, { method = 'GET', body = {} } = {}) {
  const normalizedEmail = String(body?.email || 'user@fairinvest.com').trim().toLowerCase()
  const namePart = normalizedEmail.split('@')[0] || 'Investor'
  const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1)

  if (path === '/site-links') {
    return { ok: true, status: 'success', data: [] }
  }

  if (path === '/auth/login' || path === '/auth/register') {
    const mockToken = `local-token-${Date.now()}`
    setTokens(mockToken, mockToken)
    const userProfile = {
      id: `local-${Date.now()}`,
      name: body?.name || capitalizedName,
      email: normalizedEmail,
      phone: body?.phone || '',
      balance: 1000,
      totalEarnings: 150,
      totalDeposits: 1000,
      activeInvestments: 1,
    }
    localStorage.setItem('fairinvest-local-user', JSON.stringify(userProfile))
    return {
      ok: true,
      status: 'success',
      message: path === '/auth/login' ? 'Login successful!' : 'Registration successful!',
      data: {
        accessToken: mockToken,
        refreshToken: mockToken,
        user: userProfile,
      },
    }
  }

  if (path === '/users/me') {
    const stored = localStorage.getItem('fairinvest-local-user')
    const userProfile = stored
      ? JSON.parse(stored)
      : {
          id: 'local-user',
          name: 'Investor',
          email: 'user@fairinvest.com',
          balance: 1000,
          totalEarnings: 150,
          totalDeposits: 1000,
          activeInvestments: 1,
        }
    return { ok: true, status: 'success', data: userProfile }
  }

  if (path === '/auth/logout') {
    clearTokens()
    localStorage.removeItem('fairinvest-local-user')
    return { ok: true, status: 'success', message: 'Logged out successfully.' }
  }

  if (
    path === '/auth/send-otp' ||
    path === '/auth/forgot-password' ||
    path === '/auth/verify-reset-otp' ||
    path === '/auth/reset-password'
  ) {
    return { ok: true, status: 'success', message: 'Success', devCode: '000000' }
  }

  return { ok: true, status: 'success', data: [] }
}

async function request(path, { method = 'GET', body, headers = {}, _retry = false, timeoutMs = 20000 } = {}) {
  const isClientOnHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const isBackendLocalhost = API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1')
  if (isClientOnHttps && isBackendLocalhost) {
    return handleMockRequest(path, { method, body })
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401 && !_retry && shouldAttemptRefresh(path)) {
      try {
        await refreshAccessToken()
        return request(path, { method, body, headers, _retry: true })
      } catch {
        clearTokens()
      }
    }
    if (response.status === 403 && String(payload?.message || '').toLowerCase().includes('blocked')) {
      clearTokens()
    }
    const message = payload?.message || `Request failed (${response.status})`
    const fieldErrors = payload?.details?.fieldErrors
    if (fieldErrors && typeof fieldErrors === 'object') {
      const detailText = Object.entries(fieldErrors)
        .flatMap(([field, errors]) => (Array.isArray(errors) ? errors.map((item) => `${field}: ${item}`) : []))
        .join(' ')
      if (detailText) throw new Error(`${message} ${detailText}`.trim())
    }
    throw new Error(message)
  }

  return payload
}

export { request, setTokens, clearTokens, getAccessToken, API_BASE }
