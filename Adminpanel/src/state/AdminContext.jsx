import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { API_BASE, apiRequest, clearTokens, getAccessToken, setTokens } from '../lib/api.js'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [admin, setAdmin] = useState({ id: 1, name: 'Admin User', email: 'admin@horizoneinvest.com', role: 'admin' })
  const [metrics, setMetrics] = useState(null)
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [chatRooms, setChatRooms] = useState([])
  const [plans, setPlans] = useState([])
  const [paymentAccounts, setPaymentAccounts] = useState([])
  const [bootstrapDiagnostics, setBootstrapDiagnostics] = useState({
    apiBase: API_BASE,
    lastRunAt: null,
    endpoints: [],
  })
  const [socialLinks, setSocialLinks] = useState({
    items: [],
  })

  const bootstrap = useCallback(async () => {
    try {
      let mePayload = null
      try {
        if (getAccessToken()) {
          const meRes = await apiRequest('/users/me')
          mePayload = meRes?.data || null
        }
      } catch (error) {
        // Suppress auth error to allow direct dashboard access
        console.warn('Bootstrap auth check bypassed:', error.message)
      }

      const endpoints = [
        { key: 'metrics', path: '/admin/metrics', request: apiRequest('/admin/metrics') },
        { key: 'users', path: '/admin/users', request: apiRequest('/admin/users') },
        { key: 'transactions', path: '/admin/transactions', request: apiRequest('/admin/transactions') },
        { key: 'deposits', path: '/admin/deposits', request: apiRequest('/admin/deposits') },
        { key: 'withdrawals', path: '/admin/withdrawals', request: apiRequest('/admin/withdrawals') },
        { key: 'chatRooms', path: '/chat/admin/rooms', request: apiRequest('/chat/admin/rooms') },
        { key: 'plans', path: '/admin/plans', request: apiRequest('/admin/plans') },
        { key: 'socialLinks', path: '/admin/social-links', request: apiRequest('/admin/social-links') },
        { key: 'paymentAccounts', path: '/admin/payment-accounts', request: apiRequest('/admin/payment-accounts') },
      ]
      const settled = await Promise.allSettled(endpoints.map((item) => item.request))
      const byKey = Object.fromEntries(endpoints.map((item, index) => [item.key, settled[index]]))

      setBootstrapDiagnostics({
        apiBase: API_BASE,
        lastRunAt: new Date().toISOString(),
        endpoints: endpoints.map((item, index) => {
          const result = settled[index]
          if (result.status === 'fulfilled') {
            return { path: item.path, ok: true, message: 'OK' }
          }
          return { path: item.path, ok: false, message: result.reason?.message || 'Request failed' }
        }),
      })

      const unwrap = (result, fallback) => {
        if (result.status === 'fulfilled') return result.value?.data ?? fallback
        return fallback
      }

      setAdmin(mePayload)
      setMetrics(unwrap(byKey.metrics, null))
      setUsers(unwrap(byKey.users, []))
      setTransactions(unwrap(byKey.transactions, []))
      setDeposits(unwrap(byKey.deposits, []))
      setWithdrawals(unwrap(byKey.withdrawals, []))
      setChatRooms(unwrap(byKey.chatRooms, []))
      setPlans(unwrap(byKey.plans, []))
      setSocialLinks({ items: unwrap(byKey.socialLinks, []) })
      setPaymentAccounts(unwrap(byKey.paymentAccounts, []))

      if (byKey.users.status === 'rejected') {
        return { ok: false, message: byKey.users.reason?.message || 'Failed to load users from live API.' }
      }

      return { ok: true }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      try {
        const res = await apiRequest('/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        if (res?.data?.user?.role !== 'admin') {
          return { ok: false, message: 'This account is not an admin account.' }
        }
        setTokens(res.data.accessToken, res.data.refreshToken)
        setIsAuthenticated(true)
        const boot = await bootstrap()
        if (!boot.ok) return boot
        return { ok: true, message: 'Admin login successful.' }
      } catch (error) {
        return { ok: false, message: error.message }
      }
    },
    [bootstrap],
  )

  const logout = useCallback(async () => {
    try {
      const savedRefresh = localStorage.getItem('horizoninvest-admin-refresh-token')
      if (savedRefresh) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refreshToken: savedRefresh },
        })
      }
    } catch {
      // ignore
    }
    clearTokens()
    // Login bypass: keep session active for dashboard preview
    setIsAuthenticated(true)
  }, [])

  const blockUser = useCallback(
    async (id, shouldBlock) => {
      await apiRequest(`/admin/users/${id}/${shouldBlock ? 'block' : 'unblock'}`, { method: 'PATCH' })
      await bootstrap()
    },
    [bootstrap],
  )

  const updateTransactionStatus = useCallback(
    async (id, status) => {
      await apiRequest(`/admin/transactions/${id}/status`, {
        method: 'PATCH',
        body: { status },
      })
      await bootstrap()
    },
    [bootstrap],
  )

  const updateDepositStatus = useCallback(
    async (id, status) => {
      await apiRequest(`/admin/deposits/${id}/status`, {
        method: 'PATCH',
        body: { status },
      })
      await bootstrap()
    },
    [bootstrap],
  )

  const deleteDeposit = useCallback(
    async (id) => {
      await apiRequest(`/admin/deposits/${id}`, { method: 'DELETE' })
      await bootstrap()
    },
    [bootstrap],
  )

  const updateWithdrawalStatus = useCallback(
    async (id, payload) => {
      await apiRequest(`/admin/withdrawals/${id}/status`, {
        method: 'PATCH',
        body: payload,
      })
      await bootstrap()
    },
    [bootstrap],
  )

  const getUserOverview = useCallback(async (userId) => {
    const res = await apiRequest(`/admin/users/${userId}/overview`)
    return res?.data || null
  }, [])

  const getUserReferralNetwork = useCallback(async (userId) => {
    const res = await apiRequest(`/admin/users/${userId}/referrals`)
    return res?.data || null
  }, [])

  const impersonateUser = useCallback(async (userId) => {
    const res = await apiRequest(`/admin/users/${userId}/impersonate`, { method: 'POST' })
    return res?.data || null
  }, [])

  const closeChatRoom = useCallback(
    async (id) => {
      await apiRequest(`/chat/admin/rooms/${id}/close`, { method: 'PATCH' })
      await bootstrap()
    },
    [bootstrap],
  )

  const getChatMessages = useCallback(async (roomId) => {
    const res = await apiRequest(`/chat/admin/rooms/${roomId}/messages`)
    return res?.data || []
  }, [])

  const replyChatRoom = useCallback(
    async (roomId, content) => {
      await apiRequest(`/chat/admin/rooms/${roomId}/reply`, {
        method: 'POST',
        body: { content },
      })
      await bootstrap()
    },
    [bootstrap],
  )

  const savePlan = useCallback(
    async ({ id, ...payload }) => {
      if (id) {
        await apiRequest(`/admin/plans/${id}`, {
          method: 'PATCH',
          body: payload,
        })
      } else {
        await apiRequest('/admin/plans', {
          method: 'POST',
          body: payload,
        })
      }
      await bootstrap()
    },
    [bootstrap],
  )

  const deletePlan = useCallback(
    async (id) => {
      await apiRequest(`/admin/plans/${id}`, { method: 'DELETE' })
      await bootstrap()
    },
    [bootstrap],
  )

  const createSocialLink = useCallback(
    async (payload) => {
      await apiRequest('/admin/social-links', { method: 'POST', body: payload })
      await bootstrap()
    },
    [bootstrap],
  )

  const updateSocialLink = useCallback(
    async (id, payload) => {
      await apiRequest(`/admin/social-links/${id}`, { method: 'PATCH', body: payload })
      await bootstrap()
    },
    [bootstrap],
  )

  const deleteSocialLink = useCallback(
    async (id) => {
      await apiRequest(`/admin/social-links/${id}`, { method: 'DELETE' })
      await bootstrap()
    },
    [bootstrap],
  )

  const fetchSocialLinks = useCallback(async () => {
    const res = await apiRequest('/admin/social-links')
    setSocialLinks({ items: res?.data || [] })
    return res?.data || []
  }, [])

  const createPaymentAccount = useCallback(
    async (payload) => {
      await apiRequest('/admin/payment-accounts', { method: 'POST', body: payload })
      await bootstrap()
    },
    [bootstrap],
  )

  const updatePaymentAccount = useCallback(
    async (id, payload) => {
      await apiRequest(`/admin/payment-accounts/${id}`, { method: 'PATCH', body: payload })
      await bootstrap()
    },
    [bootstrap],
  )

  const deletePaymentAccount = useCallback(
    async (id) => {
      const response = await apiRequest(`/admin/payment-accounts/${id}`, { method: 'DELETE' })
      await bootstrap()
      return response?.message || 'Payment account deleted'
    },
    [bootstrap],
  )

  const uploadMedia = useCallback(async (type, file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await apiRequest(`/admin/uploads/${type}`, {
      method: 'POST',
      body: form,
    })
    return res?.data?.path || ''
  }, [])

  const refreshUsers = useCallback(async () => {
    const res = await apiRequest('/admin/users')
    const rows = res?.data || []
    setUsers(rows)
    return rows
  }, [])

  const refreshChatRooms = useCallback(async () => {
    const res = await apiRequest('/chat/admin/rooms')
    const rows = res?.data || []
    setChatRooms(rows)
    return rows
  }, [])

  const adjustUserWallet = useCallback(
    async (userId, payload) => {
      await apiRequest(`/admin/users/${userId}/wallet-adjust`, {
        method: 'POST',
        body: payload,
      })
      await bootstrap()
    },
    [bootstrap],
  )

  const updateUserDetails = useCallback(
    async (userId, payload) => {
      await apiRequest(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: payload,
      })
      await bootstrap()
    },
    [bootstrap],
  )

  const runProfitSync = useCallback(async () => {
    const res = await apiRequest('/admin/run-profit-sync', { method: 'POST' })
    await bootstrap()
    return res
  }, [bootstrap])

  const value = useMemo(
    () => ({
      isAuthenticated,
      admin,
      metrics,
      users,
      transactions,
      deposits,
      withdrawals,
      chatRooms,
      plans,
      paymentAccounts,
      bootstrapDiagnostics,
      socialLinks,
      login,
      logout,
      bootstrap,
      blockUser,
      updateTransactionStatus,
      updateDepositStatus,
      deleteDeposit,
      updateWithdrawalStatus,
      getUserOverview,
      getUserReferralNetwork,
      impersonateUser,
      closeChatRoom,
      getChatMessages,
      replyChatRoom,
      savePlan,
      deletePlan,
      createSocialLink,
      updateSocialLink,
      deleteSocialLink,
      fetchSocialLinks,
      createPaymentAccount,
      updatePaymentAccount,
      deletePaymentAccount,
      uploadMedia,
      refreshUsers,
      refreshChatRooms,
      adjustUserWallet,
      updateUserDetails,
      runProfitSync,
    }),
    [
      isAuthenticated,
      admin,
      metrics,
      users,
      transactions,
      deposits,
      withdrawals,
      chatRooms,
      plans,
      paymentAccounts,
      bootstrapDiagnostics,
      socialLinks,
      login,
      logout,
      bootstrap,
      blockUser,
      updateTransactionStatus,
      updateDepositStatus,
      deleteDeposit,
      updateWithdrawalStatus,
      getUserOverview,
      getUserReferralNetwork,
      impersonateUser,
      closeChatRoom,
      getChatMessages,
      replyChatRoom,
      savePlan,
      deletePlan,
      createSocialLink,
      updateSocialLink,
      deleteSocialLink,
      fetchSocialLinks,
      createPaymentAccount,
      updatePaymentAccount,
      deletePaymentAccount,
      uploadMedia,
      refreshUsers,
      refreshChatRooms,
      adjustUserWallet,
      updateUserDetails,
      runProfitSync,
    ],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdmin must be used inside AdminProvider')
  return context
}
