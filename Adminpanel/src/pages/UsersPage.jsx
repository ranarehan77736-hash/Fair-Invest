import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Activity, Ban, Network, ShieldCheck, UserCircle2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'

function UserStat({ label, value, icon }) {
  const IconGlyph = icon
  return (
    <article className="stat-card">
      <div className="stat-head">
        <IconGlyph size={16} />
        <span>{label}</span>
      </div>
      <h3>{value}</h3>
    </article>
  )
}

function UsersPage() {
  const {
    users,
    blockUser,
    refreshUsers,
    adjustUserWallet,
    getUserOverview,
    getUserReferralNetwork,
    impersonateUser,
    updateUserDetails,
  } = useAdmin()
  const [overview, setOverview] = useState(null)
  const [referralData, setReferralData] = useState(null)
  const [referralLoading, setReferralLoading] = useState(false)
  const [referralError, setReferralError] = useState('')
  const [loadingOverviewId, setLoadingOverviewId] = useState(null)
  const [query, setQuery] = useState('')
  const [detailTab, setDetailTab] = useState('profile')
  const [savingProfile, setSavingProfile] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    city: '',
    postalCode: '',
    nationalId: '',
    dateOfBirth: '',
  })

  useEffect(() => {
    if (!overview?.user) return
    setProfileForm({
      name: overview.user.name || '',
      email: overview.user.email || '',
      phone: overview.user.phone || '',
      country: overview.user.country || '',
      address: overview.user.address || '',
      city: overview.user.city || '',
      postalCode: overview.user.postalCode || '',
      nationalId: overview.user.nationalId || '',
      dateOfBirth: overview.user.dateOfBirth ? String(overview.user.dateOfBirth).slice(0, 10) : '',
    })
  }, [overview])

  useEffect(() => {
    const openUser = Number(searchParams.get('openUser') || 0)
    if (!openUser || !users.some((item) => Number(item.id) === openUser)) return
    ;(async () => {
      try {
        const data = await getUserOverview(openUser)
        setOverview(data)
        setDetailTab('profile')
      } catch (error) {
        toast.error(error.message || 'Failed to load user overview')
      } finally {
        const next = new URLSearchParams(searchParams)
        next.delete('openUser')
        setSearchParams(next, { replace: true })
      }
    })()
  }, [searchParams, setSearchParams, users, getUserOverview])

  useEffect(() => {
    if (!overview?.user?.id || detailTab !== 'referrals') return undefined
    let cancelled = false
    setReferralLoading(true)
    setReferralError('')
    getUserReferralNetwork(overview.user.id)
      .then((data) => {
        if (!cancelled) setReferralData(data)
      })
      .catch((error) => {
        if (!cancelled) {
          setReferralData(null)
          setReferralError(error.message || 'Failed to load referral network')
        }
      })
      .finally(() => {
        if (!cancelled) setReferralLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [overview?.user?.id, detailTab, getUserReferralNetwork])

  const handleToggle = async (user) => {
    try {
      await blockUser(user.id, !user.isBlocked)
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked')
      if (overview?.user?.id === user.id) {
        setOverview((prev) => (prev ? { ...prev, user: { ...prev.user, isBlocked: !prev.user.isBlocked } } : prev))
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRefresh = async () => {
    try {
      const rows = await refreshUsers()
      toast.success(`Live data synced (${rows.length} users)`)
    } catch (error) {
      toast.error(error.message || 'Failed to load users from live API')
    }
  }

  const handleWalletAdjust = async (user, direction) => {
    const raw = window.prompt(`Enter amount to ${direction === 'credit' ? 'add to' : 'deduct from'} wallet:`)
    if (!raw) return
    const amount = Number(raw)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    try {
      await adjustUserWallet(user.id, {
        delta: direction === 'credit' ? amount : -amount,
        reason: `admin_${direction}`,
      })
      toast.success('Wallet updated')
      if (overview?.user?.id === user.id) {
        setOverview((prev) =>
          prev
            ? {
                ...prev,
                user: {
                  ...prev.user,
                  walletBalance: Number(prev.user.walletBalance || 0) + (direction === 'credit' ? amount : -amount),
                },
              }
            : prev,
        )
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleOpenOverview = async (userId) => {
    setLoadingOverviewId(userId)
    try {
      const data = await getUserOverview(userId)
      setOverview(data)
      setDetailTab('profile')
    } catch (error) {
      toast.error(error.message || 'Failed to load user overview')
    } finally {
      setLoadingOverviewId(null)
    }
  }

  const handleImpersonate = async (user) => {
    try {
      const payload = await impersonateUser(user.id)
      if (!payload?.accessToken) throw new Error('No token returned')
      await navigator.clipboard.writeText(payload.accessToken)
      toast.success(`Impersonation token copied for ${user.email}`)
    } catch (error) {
      toast.error(error.message || 'Failed to create impersonation token')
    }
  }

  const handleSaveProfile = async () => {
    if (!overview?.user?.id) return
    setSavingProfile(true)
    try {
      await updateUserDetails(overview.user.id, profileForm)
      const fresh = await getUserOverview(overview.user.id)
      setOverview(fresh)
      toast.success('User details updated')
    } catch (error) {
      toast.error(error.message || 'Failed to update user')
    } finally {
      setSavingProfile(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return users
    return users.filter((user) =>
      [user.name, user.email, user.phone, user.country, user.role].some((field) =>
        String(field || '')
          .toLowerCase()
          .includes(keyword),
      ),
    )
  }, [users, query])

  const stats = useMemo(
    () => ({
      total: users.length,
      blocked: users.filter((item) => item.isBlocked).length,
      admins: users.filter((item) => item.role === 'admin').length,
      totalWallet: users.reduce((acc, item) => acc + Number(item.walletBalance || 0), 0),
    }),
    [users],
  )

  const detailTabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'referrals', label: 'Referral network' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'investments', label: 'Investments' },
    { key: 'deposits', label: 'Deposits' },
    { key: 'withdrawals', label: 'Withdrawals' },
    { key: 'commissions', label: 'Commissions' },
    { key: 'profits', label: 'Daily Profits' },
  ]

  const investmentSummary = useMemo(() => {
    const list = overview?.investments || []
    const active = list.filter((item) => item.status === 'active')
    return {
      activeCount: active.length,
      activeAmount: active.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      activePlans: active.slice(0, 6).map((item) => item.planName),
      totalInvested: list.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    }
  }, [overview])

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Users</h2>
        <p>A to Z user records, account actions, and account intelligence.</p>
        <div className="plan-actions">
          <input
            placeholder="Search by name, email, phone, role..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="mini-btn" onClick={handleRefresh}>
            Refresh Live Data
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <UserStat label="Total Users" value={stats.total} icon={UserCircle2} />
        <UserStat label="Blocked Users" value={stats.blocked} icon={Ban} />
        <UserStat label="Admin Accounts" value={stats.admins} icon={ShieldCheck} />
        <UserStat label="Total Wallet Value" value={`$${stats.totalWallet.toFixed(2)}`} icon={Wallet} />
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Country</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="user-row-clickable" onClick={() => handleOpenOverview(user.id)}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.role}</td>
                  <td>{user.country || '-'}</td>
                  <td>${Number(user.walletBalance || 0).toFixed(2)}</td>
                  <td>{user.isBlocked ? 'Blocked' : 'Active'}</td>
                  <td>
                    <div className="row-action-group">
                      <button
                        className="mini-btn"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleToggle(user)
                        }}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        className="mini-btn"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleWalletAdjust(user, 'credit')
                        }}
                      >
                        + Wallet
                      </button>
                      <button
                        className="mini-btn danger-inline"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleWalletAdjust(user, 'debit')
                        }}
                      >
                        - Wallet
                      </button>
                      <button
                        className="mini-btn"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleOpenOverview(user.id)
                        }}
                      >
                        {loadingOverviewId === user.id ? 'Loading...' : 'Full Record'}
                      </button>
                      <button
                        className="mini-btn"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleImpersonate(user)
                        }}
                      >
                        Login As User
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="table-empty">
                  No users matched your search or no users returned from API.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {overview ? (
        <div
          className="record-modal"
          onClick={() => {
            setReferralData(null)
            setReferralError('')
            setOverview(null)
          }}
        >
          <div className="record-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="user-overview-head">
              <div>
                <h3>User A-Z Overview: {overview.user?.name}</h3>
                <p className="muted">
                  {overview.user?.email || '-'} | {overview.user?.phone || '-'} | Wallet: $
                  {Number(overview.user?.walletBalance || 0).toFixed(2)} | Locked: $
                  {Number(overview.user?.lockedBalance || 0).toFixed(2)}
                </p>
              </div>
              <button
                className="mini-btn"
                onClick={() => {
                  setReferralData(null)
                  setReferralError('')
                  setOverview(null)
                }}
              >
                Close
              </button>
            </div>

            <div className="plan-actions">
              <button className="mini-btn" onClick={() => handleToggle(overview.user)}>
                {overview.user?.isBlocked ? 'Unblock User' : 'Block User'}
              </button>
              <button className="mini-btn" onClick={() => handleWalletAdjust(overview.user, 'credit')}>
                Add Wallet Balance
              </button>
              <button className="mini-btn danger-inline" onClick={() => handleWalletAdjust(overview.user, 'debit')}>
                Deduct Wallet Balance
              </button>
              <button className="mini-btn" onClick={() => handleImpersonate(overview.user)}>
                Login As User
              </button>
            </div>

            <div className="user-overview-grid">
              <div className="user-overview-tile">
                <strong>Investment Summary</strong>
                <p>Active Investments: {investmentSummary.activeCount}</p>
                <p>Active Amount: ${investmentSummary.activeAmount.toFixed(2)}</p>
                <p>Total Invested: ${investmentSummary.totalInvested.toFixed(2)}</p>
                <p>Active Plans: {investmentSummary.activePlans.join(', ') || '-'}</p>
              </div>
              <div className="user-overview-tile">
                <strong>Funds Status</strong>
                <p>Wallet Balance: ${Number(overview.user?.walletBalance || 0).toFixed(2)}</p>
                <p>Locked Deposit Funds: ${Number(overview.user?.lockedBalance || 0).toFixed(2)}</p>
                <p>
                  Withdrawable: $
                  {Math.max(
                    0,
                    Number(overview.user?.walletBalance || 0) - Number(overview.user?.lockedBalance || 0),
                  ).toFixed(2)}
                </p>
              </div>
              <div className="user-overview-tile">
                <strong>Activity Snapshot</strong>
                <p>
                  <Activity size={14} /> Transactions: {overview.transactions?.length || 0}
                </p>
                <p>Deposits: {overview.deposits?.length || 0}</p>
                <p>Withdrawals: {overview.withdrawals?.length || 0}</p>
                <p>Commissions: {overview.commissions?.length || 0}</p>
              </div>
            </div>

            <div className="user-detail-tabs">
              {detailTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`user-detail-tab ${detailTab === tab.key ? 'active' : ''}`}
                  onClick={() => setDetailTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {detailTab === 'referrals' ? (
              <div className="user-overview-table-wrap">
                <h4>
                  <Network size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Referral network (downline)
                </h4>
                {referralLoading ? (
                  <p className="muted">Loading referral data…</p>
                ) : referralError ? (
                  <p className="error-text">{referralError}</p>
                ) : referralData ? (
                  <>
                    <div className="user-overview-grid" style={{ marginBottom: '1rem' }}>
                      <div className="user-overview-tile">
                        <strong>Summary</strong>
                        <p>Direct: {referralData.summary?.directReferrals ?? 0}</p>
                        <p>Indirect: {referralData.summary?.indirectReferrals ?? 0}</p>
                        <p>Total downline: {referralData.summary?.totalReferrals ?? 0}</p>
                        <p>
                          Commission earned (this user): $
                          {Number(referralData.summary?.totalCommissionEarnings || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="user-overview-tile">
                        <strong>Referral link</strong>
                        <p className="muted small" style={{ wordBreak: 'break-all' }}>
                          Code: {referralData.referralCode || '—'}
                        </p>
                        {referralData.referralLink ? (
                          <p className="muted small" style={{ wordBreak: 'break-all' }}>
                            {referralData.referralLink}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Level</th>
                          <th>Joined</th>
                          <th>Deposits</th>
                          <th>Withdrawals</th>
                          <th>Invested</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(referralData.network || []).length ? (
                          referralData.network.map((row) => (
                            <tr key={`${row.id}-${row.level}`}>
                              <td>{row.id}</td>
                              <td>{row.username || row.name}</td>
                              <td>{row.email}</td>
                              <td>{row.phone || '—'}</td>
                              <td>{Number(row.level) === 1 ? 'Direct' : `L${row.level}`}</td>
                              <td>{String(row.joinedAt || '').slice(0, 10) || '—'}</td>
                              <td>
                                ${Number(row.totalDeposits || 0).toFixed(2)}
                                <span className="muted small"> ({row.completedDepositCount || 0})</span>
                              </td>
                              <td>
                                ${Number(row.totalWithdrawals || 0).toFixed(2)}
                                <span className="muted small"> ({row.completedWithdrawalCount || 0})</span>
                              </td>
                              <td>
                                ${Number(row.totalInvested || 0).toFixed(2)}
                                <span className="muted small"> ({row.investmentCount || 0})</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="table-empty">
                              No referrals in this user&apos;s network yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className="muted">No data.</p>
                )}
              </div>
            ) : null}

            {detailTab === 'profile' ? (
              <div className="user-overview-grid">
                <div className="user-overview-tile">
                  <strong>Edit Profile</strong>
                  <input value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
                  <input value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
                  <input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
                  <input value={profileForm.country} onChange={(e) => setProfileForm((p) => ({ ...p, country: e.target.value }))} placeholder="Country" />
                  <input value={profileForm.address} onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address" />
                  <input value={profileForm.city} onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" />
                  <input
                    value={profileForm.postalCode}
                    onChange={(e) => setProfileForm((p) => ({ ...p, postalCode: e.target.value }))}
                    placeholder="Postal Code"
                  />
                  <input
                    value={profileForm.nationalId}
                    onChange={(e) => setProfileForm((p) => ({ ...p, nationalId: e.target.value }))}
                    placeholder="National ID"
                  />
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  />
                  <button className="primary-btn" disabled={savingProfile} onClick={handleSaveProfile}>
                    {savingProfile ? 'Saving...' : 'Save User Details'}
                  </button>
                </div>
              </div>
            ) : null}

            {detailTab === 'transactions' ? (
              <div className="user-overview-table-wrap">
                <h4>Transaction History</h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Method</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview.transactions || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.type}</td>
                        <td>${Number(item.amount || 0).toFixed(2)}</td>
                        <td>{item.status}</td>
                        <td>{item.method || '-'}</td>
                        <td>{item.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {detailTab === 'investments' ? (
              <div className="user-overview-table-wrap">
                <h4>Investment History</h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Expected Return</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview.investments || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.planName}</td>
                        <td>${Number(item.amount || 0).toFixed(2)}</td>
                        <td>${Number(item.expectedReturn || 0).toFixed(2)}</td>
                        <td>{item.status}</td>
                        <td>{String(item.startDate || '').slice(0, 10) || '-'}</td>
                        <td>{String(item.endDate || '').slice(0, 10) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {detailTab === 'deposits' ? (
              <div className="user-overview-table-wrap">
                <h4>Deposit History</h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview.deposits || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>${Number(item.amount || 0).toFixed(2)}</td>
                        <td>{item.method}</td>
                        <td>{item.status}</td>
                        <td>{item.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {detailTab === 'withdrawals' ? (
              <div className="user-overview-table-wrap">
                <h4>Withdrawal History</h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Amount</th>
                      <th>Fee</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Approved</th>
                      <th>Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview.withdrawals || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>${Number(item.amount || 0).toFixed(2)}</td>
                        <td>${Number(item.fee || 0).toFixed(2)}</td>
                        <td>{item.method}</td>
                        <td>{item.status}</td>
                        <td>${Number(item.approvedAmount || 0).toFixed(2)}</td>
                        <td>${Number(item.refundAmount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {detailTab === 'commissions' ? (
              <div className="user-overview-table-wrap">
                <h4>Commission History</h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Amount</th>
                      <th>Rate %</th>
                      <th>Status</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview.commissions || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>${Number(item.amount || 0).toFixed(2)}</td>
                        <td>{Number(item.ratePercent || 0).toFixed(2)}%</td>
                        <td>{item.status}</td>
                        <td>{item.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {detailTab === 'profits' ? (
              <div className="user-overview-table-wrap">
                <h4>Daily Profit Ledger</h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Investment ID</th>
                      <th>Day</th>
                      <th>Amount</th>
                      <th>Reference</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview.dailyProfits || []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.investmentId}</td>
                        <td>{item.dayIndex}</td>
                        <td>${Number(item.amount || 0).toFixed(4)}</td>
                        <td>{item.reference || '-'}</td>
                        <td>{String(item.createdAt || '').slice(0, 10) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default UsersPage
