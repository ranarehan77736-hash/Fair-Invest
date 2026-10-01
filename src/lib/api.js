const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

let accessToken = localStorage.getItem('horizoninvest-access-token') || ''
let refreshToken = localStorage.getItem('horizoninvest-refresh-token') || ''

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

const DEFAULT_MOCK_USERS = {
  'ranarehan77736@gmail.com': {
    id: 'user-2',
    name: 'Rana Rehan',
    email: 'ranarehan77736@gmail.com',
    password: 'Admin@12345',
    balance: 0.00,
    lockedBalance: 0.00,
    totalEarnings: 0.00,
    totalDeposits: 0.00,
    activeInvestments: 0,
  },
  'admin@fairinvest.com': {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@fairinvest.com',
    password: 'Admin@12345',
    balance: 0.00,
    lockedBalance: 0.00,
    totalEarnings: 0.00,
    totalDeposits: 0.00,
    activeInvestments: 0,
  },
  'demo@fairinvest.com': {
    id: 'user-3',
    name: 'Demo User',
    email: 'demo@fairinvest.com',
    password: 'password123',
    balance: 0.00,
    lockedBalance: 0.00,
    totalEarnings: 0.00,
    totalDeposits: 0.00,
    activeInvestments: 0,
  },
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem('fairinvest-users-db')
    const parsed = raw ? JSON.parse(raw) : {}
    return { ...DEFAULT_MOCK_USERS, ...parsed }
  } catch {
    return { ...DEFAULT_MOCK_USERS }
  }
}

function saveUserRecord(email, userRecord) {
  const users = getStoredUsers()
  users[email.toLowerCase()] = userRecord
  localStorage.setItem('fairinvest-users-db', JSON.stringify(users))
}

function handleMockRequest(path, { method: _method = 'GET', body = {} } = {}) {
  const normalizedEmail = String(body?.email || 'demo@fairinvest.com').trim().toLowerCase()
  const namePart = normalizedEmail.split('@')[0] || 'Investor'
  const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1)

  if (path === '/site-links') {
    return {
      ok: true,
      status: 'success',
      data: [
        { id: 1, platform: 'whatsapp', url: 'https://whatsapp.com/channel/0029Vb9YnsS4dTnBGIVclZ1r', label: 'Follow Fair invest Official Channel' },
        { id: 2, platform: 'telegram', url: 'https://telegram.org', label: 'Telegram VIP Community' },
      ],
    }
  }

  if (path === '/auth/login') {
    const storedUsers = getStoredUsers()
    const existingUser = storedUsers[normalizedEmail]

    if (!existingUser) {
      return {
        ok: false,
        status: 'error',
        message: 'Invalid email or password. Please check your credentials or register.',
      }
    }

    if (existingUser.password && body?.password !== existingUser.password) {
      return {
        ok: false,
        status: 'error',
        message: 'Invalid email or password. Please enter your correct password.',
      }
    }

    const mockToken = `local-token-${Date.now()}`
    setTokens(mockToken, mockToken)

    const userProfile = {
      id: existingUser?.id || `user-${Date.now()}`,
      name: existingUser?.name || capitalizedName,
      email: normalizedEmail,
      phone: existingUser?.phone || '',
      balance: existingUser?.balance ?? 0.00,
      lockedBalance: existingUser?.lockedBalance ?? 0.00,
      totalEarnings: existingUser?.totalEarnings ?? 0.00,
      totalDeposits: existingUser?.totalDeposits ?? 0.00,
      activeInvestments: existingUser?.activeInvestments ?? 0,
    }

    saveUserRecord(normalizedEmail, {
      ...userProfile,
      password: body?.password || existingUser?.password || '',
    })

    localStorage.setItem('fairinvest-local-user', JSON.stringify(userProfile))
    localStorage.setItem('fairinvest-saved-email', normalizedEmail)
    if (body?.password) {
      localStorage.setItem('fairinvest-saved-password', body.password)
    }

    return {
      ok: true,
      status: 'success',
      message: 'Login successful!',
      data: {
        accessToken: mockToken,
        refreshToken: mockToken,
        user: userProfile,
      },
    }
  }

  if (path === '/auth/register') {
    const mockToken = `local-token-${Date.now()}`
    setTokens(mockToken, mockToken)

    const userProfile = {
      id: `user-${Date.now()}`,
      name: body?.name || capitalizedName,
      email: normalizedEmail,
      phone: body?.phone || '',
      balance: 0.00,
      lockedBalance: 0.00,
      totalEarnings: 0.00,
      totalDeposits: 0.00,
      activeInvestments: 0,
    }

    saveUserRecord(normalizedEmail, {
      ...userProfile,
      password: body?.password || '',
    })

    localStorage.setItem('fairinvest-local-user', JSON.stringify(userProfile))
    localStorage.setItem('fairinvest-saved-email', normalizedEmail)
    if (body?.password) {
      localStorage.setItem('fairinvest-saved-password', body.password)
    }

    return {
      ok: true,
      status: 'success',
      message: 'Registration successful!',
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
          name: 'Investor',
          email: 'demo@fairinvest.com',
          phone: '',
          country: 'Pakistan',
          referralCode: 'DEMO789',
          balance: 0.00,
          lockedBalance: 0.00,
          totalDeposits: 0.00,
          totalEarnings: 0.00,
          activeInvestments: 0,
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
          minAmount: 1,
          maxAmount: 999,
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
    const stored = localStorage.getItem('fairinvest-user-investments')
    return {
      ok: true,
      status: 'success',
      data: stored ? JSON.parse(stored) : [],
    }
  }

  if (path === '/wallet/transactions') {
    const stored = localStorage.getItem('fairinvest-user-transactions')
    return {
      ok: true,
      status: 'success',
      data: stored ? JSON.parse(stored) : [],
    }
  }

  if (path === '/wallet/withdrawals') {
    const stored = localStorage.getItem('fairinvest-user-withdrawals')
    return {
      ok: true,
      status: 'success',
      data: stored ? JSON.parse(stored) : [],
      cooldown: { canWithdraw: true, nextAllowedAt: null, hoursRemaining: 0 },
    }
  }

  if (path === '/wallet/deposits') {
    const stored = localStorage.getItem('fairinvest-user-deposits')
    return {
      ok: true,
      status: 'success',
      data: stored ? JSON.parse(stored) : [],
    }
  }

  if (path === '/referrals/overview') {
    const stored = localStorage.getItem('fairinvest-user-referral-overview')
    return {
      ok: true,
      status: 'success',
      data: stored
        ? JSON.parse(stored)
        : {
            totalReferrals: 0,
            directReferrals: 0,
            indirectReferrals: 0,
            totalEarnings: 0.00,
          },
    }
  }

  if (path === '/referrals/tree') {
    const stored = localStorage.getItem('fairinvest-user-referral-tree')
    return {
      ok: true,
      status: 'success',
      data: stored ? JSON.parse(stored) : [],
    }
  }

  if (path === '/referrals/earnings') {
    const stored = localStorage.getItem('fairinvest-user-referral-earnings')
    return {
      ok: true,
      status: 'success',
      data: {
        entries: stored ? JSON.parse(stored) : [],
      },
    }
  }

  if (path === '/referrals/commission-structure') {
    return {
      ok: true,
      status: 'success',
      data: [
        { level: 1, ratePercent: 10 },
        { level: 2, ratePercent: 5 },
        { level: 3, ratePercent: 2 },
      ],
    }
  }

  if (path === '/notifications/mine') {
    const stored = localStorage.getItem('fairinvest-user-notifications')
    return {
      ok: true,
      status: 'success',
      data: stored ? JSON.parse(stored) : [],
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

  if (path === '/chat/room') {
    return {
      ok: true,
      status: 'success',
      data: { room_key: 'demo-chat-room-101' },
    }
  }

  if (path.startsWith('/chat/') && path.endsWith('/messages')) {
    return {
      ok: true,
      status: 'success',
      data: [
        { id: 1, senderRole: 'admin', content: 'Welcome to FairInvest support! How can we assist you with your investments today?' },
      ],
    }
  }

  if (path === '/chat/message') {
    return {
      ok: true,
      status: 'success',
      message: 'Message sent',
    }
  }

  return { ok: true, status: 'success', message: 'Operation successful (Frontend Demo)', data: [] }
}

async function request(path, { method = 'GET', body } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const headers = {}
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    headers['X-Access-Token'] = token
    headers['X-HTTP-Authorization'] = `Bearer ${token}`
  }

  try {
    const controller = new AbortController()
    const timeoutMs = isFormData ? 30000 : 8000
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: data?.message || data?.error || (res.status === 401 ? 'Session expired. Please log in again.' : 'Request failed.'),
        data: data?.data || null,
      }
    }

    return {
      ok: true,
      status: res.status,
      message: data?.message || 'Success',
      data: data?.data ?? data,
    }
  } catch {
    return handleMockRequest(path, { method, body })
  }
}

export { request, setTokens, clearTokens, getAccessToken, API_BASE }
