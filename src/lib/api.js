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
  const normalizedEmail = String(body?.email || 'demo@fairinvest.com').trim().toLowerCase()
  const namePart = normalizedEmail.split('@')[0] || 'Demo Investor'
  const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1)

  if (path === '/site-links') {
    return {
      ok: true,
      status: 'success',
      data: [
        { platform: 'whatsapp', url: 'https://whatsapp.com', label: 'Official WhatsApp' },
        { platform: 'telegram', url: 'https://telegram.org', label: 'Telegram VIP Community' },
      ],
    }
  }

  if (path === '/auth/login' || path === '/auth/register') {
    const mockToken = `demo-token-${Date.now()}`
    setTokens(mockToken, mockToken)
    const userProfile = {
      id: `demo-${Date.now()}`,
      name: body?.name || capitalizedName,
      email: normalizedEmail,
      phone: body?.phone || '+92 300 1234567',
      balance: 5450.00,
      totalEarnings: 1650.25,
      totalDeposits: 5000.00,
      activeInvestments: 2,
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
          id: 'demo-user-1',
          name: 'Demo Investor',
          email: 'demo@fairinvest.com',
          phone: '+92 300 1234567',
          country: 'Pakistan',
          referralCode: 'DEMO789',
          balance: 5450.00,
          lockedBalance: 1200.00,
          totalDeposits: 5000.00,
          totalEarnings: 1650.25,
          activeInvestments: 2,
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

  if (path === '/investments/plans') {
    return {
      ok: true,
      status: 'success',
      data: [
        {
          id: 1,
          slug: 'starter',
          name: 'Starter Growth Plan',
          minAmount: 100,
          maxAmount: 1000,
          durationDays: 30,
          dailyReturn: 1.5,
          totalReturn: 145,
          features: ['Daily Automatic Payouts', 'Capital Back at Maturity', 'Standard Support 24/7'],
          imagePath: '',
        },
        {
          id: 2,
          slug: 'professional',
          name: 'Professional Yield Plan',
          minAmount: 500,
          maxAmount: 5000,
          durationDays: 60,
          dailyReturn: 2.2,
          totalReturn: 232,
          features: ['High Yield Compound Payouts', 'Instant Withdrawal Access', 'Dedicated Portfolio Manager'],
          imagePath: '',
        },
        {
          id: 3,
          slug: 'institutional',
          name: 'Institutional VIP Plan',
          minAmount: 2500,
          maxAmount: 50000,
          durationDays: 90,
          dailyReturn: 3.0,
          totalReturn: 370,
          features: ['Maximum Algorithmic Return', 'Zero Withdrawal Fees', 'VIP Priority Support & Insured Principal'],
          imagePath: '',
        },
      ],
    }
  }

  if (path === '/investments/mine') {
    return {
      ok: true,
      status: 'success',
      data: [
        {
          id: 101,
          planName: 'Professional Yield Plan',
          amount: 1000,
          status: 'active',
          startDate: '2026-09-20T10:00:00Z',
          endDate: '2026-11-19T10:00:00Z',
          expectedReturn: 2320,
          profit: 110,
          claimedEarning: 0,
          accruedEarning: 110,
          availableEarning: 110,
          progressPercent: 18,
          canWithdrawEarning: true,
        },
        {
          id: 102,
          planName: 'Starter Growth Plan',
          amount: 500,
          status: 'active',
          startDate: '2026-09-23T10:00:00Z',
          endDate: '2026-10-23T10:00:00Z',
          expectedReturn: 725,
          profit: 15,
          claimedEarning: 0,
          accruedEarning: 15,
          availableEarning: 15,
          progressPercent: 8,
          canWithdrawEarning: true,
        },
      ],
    }
  }

  if (path === '/wallet/transactions') {
    return {
      ok: true,
      status: 'success',
      data: [
        { id: 1001, type: 'deposit', amount: 5000, status: 'completed', method: 'Bank Transfer', createdAt: '2026-09-19T12:00:00Z' },
        { id: 1002, type: 'investment', amount: 1000, status: 'completed', method: 'Professional Yield Plan', createdAt: '2026-09-20T10:00:00Z' },
        { id: 1003, type: 'earning', amount: 110, status: 'completed', method: 'Daily Yield Payout', createdAt: '2026-09-24T08:00:00Z' },
        { id: 1004, type: 'withdrawal', amount: 500, status: 'completed', method: 'Easypaisa', createdAt: '2026-09-22T14:30:00Z' },
      ],
    }
  }

  if (path === '/wallet/withdrawals') {
    return {
      ok: true,
      status: 'success',
      data: [
        { id: 201, method: 'easypaisa', amount: 500, status: 'approved', createdAt: '2026-09-22T14:30:00Z', accountDetails: { title: 'Demo User', number: '03001234567' } },
      ],
      cooldown: { canWithdraw: true, nextAllowedAt: null, hoursRemaining: 0 },
    }
  }

  if (path === '/wallet/deposits') {
    return {
      ok: true,
      status: 'success',
      data: [
        { id: 301, amount: 5000, method: 'Bank Transfer', status: 'approved', createdAt: '2026-09-19T12:00:00Z' },
      ],
    }
  }

  if (path === '/referrals/overview') {
    return {
      ok: true,
      status: 'success',
      data: {
        totalReferrals: 3,
        directReferrals: 2,
        indirectReferrals: 1,
        totalEarnings: 350.00,
      },
    }
  }

  if (path === '/notifications/mine') {
    return {
      ok: true,
      status: 'success',
      data: [
        { id: 1, title: 'Welcome to FairInvest Demo', message: 'Your investor account is active and verified.', read: true, createdAt: '2026-09-25T08:00:00Z' },
        { id: 2, title: 'Yield Distributed', message: '+$110.00 profit credited from Professional Yield Plan.', read: false, createdAt: '2026-09-24T10:00:00Z' },
      ],
    }
  }

  if (path === '/payment-accounts') {
    return {
      ok: true,
      status: 'success',
      data: [
        { id: 1, bankName: 'Meezan Bank', accountTitle: 'FairInvest Treasury', accountNumber: '0101-0203040506', iban: 'PK36MEZN0001010203040506' },
        { id: 2, bankName: 'Easypaisa', accountTitle: 'FairInvest Official', accountNumber: '0300-1234567', iban: 'N/A' },
      ],
    }
  }

  return { ok: true, status: 'success', message: 'Operation successful (Demo Mode)', data: [] }
}

async function request(path, { method = 'GET', body, headers = {}, _retry = false, timeoutMs = 20000 } = {}) {
  const isLiveHttpsBackend = String(API_BASE || '').startsWith('https://')

  // In Demo Mode (or when live HTTPS backend URL is not set), route directly to mock handler with 0 network calls
  if (!isLiveHttpsBackend) {
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
    if (fieldErrors && typeof fieldErrors === 'object' && fieldErrors !== null) {
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
