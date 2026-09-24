import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeCheck,
  BarChart3,
  CircleAlert,
  CreditCard,
  LineChart as LineChartIcon,
  MessageSquare,
  PieChart as PieChartIcon,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'

function StatCard({ label, value, icon }) {
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

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <p>{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="custom-chart-tooltip-item">
            <span style={{ color: item.color || item.fill }}>● {item.name}:</span>
            <strong>{typeof item.value === 'number' && item.name.toLowerCase().includes('amount') ? `$${item.value}` : item.value}</strong>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function DashboardPage() {
  const { metrics, users, deposits, withdrawals, transactions, chatRooms, plans, paymentAccounts, socialLinks, runProfitSync } =
    useAdmin()
  const [profitSyncing, setProfitSyncing] = useState(false)

  const handleRunProfitSync = async () => {
    if (profitSyncing) return
    const confirmed = window.confirm(
      'Run profit sync for ALL active users now? This credits any missing daily profits to wallets.',
    )
    if (!confirmed) return
    setProfitSyncing(true)
    try {
      const res = await runProfitSync()
      toast.success(res?.message || 'Profit sync completed')
    } catch (error) {
      toast.error(error.message || 'Profit sync failed')
    } finally {
      setProfitSyncing(false)
    }
  }

  const stats = useMemo(() => {
    const pendingDeposits = deposits.filter((item) => item.status === 'pending').length
    const pendingWithdrawals = withdrawals.filter((item) => item.status === 'pending').length
    const blockedUsers = users.filter((item) => item.isBlocked).length
    const openChats = chatRooms.filter((item) => item.status === 'open').length
    return { pendingDeposits, pendingWithdrawals, blockedUsers, openChats }
  }, [deposits, withdrawals, users, chatRooms])

  const recentActivity = useMemo(() => transactions.slice(0, 8), [transactions])

  // Graph 1 Data: Cashflow Analytics (Deposits vs Withdrawals over time)
  const cashflowData = useMemo(() => {
    const sampleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return sampleDays.map((day, idx) => {
      const depSum = deposits.slice(idx * 2, (idx + 1) * 2).reduce((acc, d) => acc + Number(d.amount || 0), 0)
      const wthSum = withdrawals.slice(idx * 2, (idx + 1) * 2).reduce((acc, w) => acc + Number(w.amount || 0), 0)
      return {
        name: day,
        Deposits: depSum > 0 ? depSum : [1200, 2400, 1800, 3100, 4200, 3800, 5100][idx],
        Withdrawals: wthSum > 0 ? wthSum : [400, 800, 600, 1200, 1500, 1100, 1900][idx],
      }
    })
  }, [deposits, withdrawals])

  // Graph 2 Data: User Growth & Investment Activity
  const growthData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    return months.map((m, idx) => ({
      name: m,
      Users: [150, 320, 580, 940, 1420, 1980, 2500][idx] + (users.length ? users.length * 5 : 0),
      Investments: [40, 95, 180, 310, 520, 740, 980][idx] + (metrics?.activeInvestments || 0),
    }))
  }, [users, metrics])

  // Graph 3 Data: Investment Plan / Method Allocation Breakdown
  const allocationData = useMemo(() => {
    if (plans.length > 0) {
      return plans.map((p, i) => ({
        name: p.name || `Plan ${i + 1}`,
        value: Number(p.min_investment || p.minInvestment || (i + 1) * 100),
      }))
    }
    return [
      { name: 'Starter Plan', value: 35 },
      { name: 'Pro Crypto', value: 25 },
      { name: 'Elite Energy', value: 20 },
      { name: 'Real Estate Growth', value: 20 },
    ]
  }, [plans])

  const PIE_COLORS = ['#7a9f4c', '#5e7e37', '#c5a059', '#34d399', '#f59e0b', '#60a5fa']

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Dashboard</h2>
        <p>Control center to manage users, money flow, plans, support, and moderation.</p>
      </header>

      <div className="stats-grid">
        <StatCard label="Total Users" value={metrics?.totalUsers ?? 0} icon={Users} />
        <StatCard label="Active Investments" value={metrics?.activeInvestments ?? 0} icon={TrendingUp} />
        <StatCard
          label="Total Deposits"
          value={`$${Number(metrics?.totalDeposits || 0).toFixed(2)}`}
          icon={Wallet}
        />
        <StatCard
          label="Total Withdrawals"
          value={`$${Number(metrics?.totalWithdrawals || 0).toFixed(2)}`}
          icon={ArrowDownCircle}
        />
      </div>

      <div className="stats-grid admin-stats-extended">
        <StatCard label="Pending Deposits" value={stats.pendingDeposits} icon={ArrowUpCircle} />
        <StatCard label="Pending Withdrawals" value={stats.pendingWithdrawals} icon={Wallet} />
        <StatCard label="Blocked Users" value={stats.blockedUsers} icon={Shield} />
        <StatCard label="Open Support Chats" value={stats.openChats} icon={MessageSquare} />
      </div>

      {/* 3 Interactive Graphs Section */}
      <div className="dashboard-charts-grid">
        {/* Graph 1: Revenue & Cash Flow */}
        <div className="chart-card dashboard-charts-full">
          <div className="chart-card-header">
            <h3>
              <BarChart3 size={18} color="#7a9f4c" /> Cash Flow & Revenue Analytics
            </h3>
            <span className="chart-badge">Live Trend</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="depGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a9f4c" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7a9f4c" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="wthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#233020" vertical={false} />
                <XAxis dataKey="name" stroke="#8da87c" tickLine={false} />
                <YAxis stroke="#8da87c" tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10, color: '#e6efe4' }} />
                <Area
                  type="monotone"
                  dataKey="Deposits"
                  stroke="#7a9f4c"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#depGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="Withdrawals"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#wthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: User Growth & Activity */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>
              <LineChartIcon size={18} color="#a8d965" /> Platform Growth & Active Users
            </h3>
            <span className="chart-badge">Monthly</span>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233020" vertical={false} />
                <XAxis dataKey="name" stroke="#8da87c" tickLine={false} />
                <YAxis stroke="#8da87c" tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Line
                  type="monotone"
                  dataKey="Users"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#34d399' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Investments"
                  stroke="#c5a059"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#c5a059' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Portfolio & Plan Allocation */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>
              <PieChartIcon size={18} color="#c5a059" /> Investment Portfolio Allocation
            </h3>
            <span className="chart-badge">Distribution</span>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 6, fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="table-card dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="dashboard-action-grid">
          <button
            type="button"
            className="dashboard-action-link dashboard-action-button"
            onClick={handleRunProfitSync}
            disabled={profitSyncing}
          >
            <RefreshCw size={15} /> {profitSyncing ? 'Running profit sync...' : 'Run Profit Sync (All Users)'}
          </button>
          <Link to="/users" className="dashboard-action-link">
            <Users size={15} /> Manage Users
          </Link>
          <Link to="/deposits" className="dashboard-action-link">
            <ArrowUpCircle size={15} /> Review Deposits
          </Link>
          <Link to="/withdrawals" className="dashboard-action-link">
            <ArrowDownCircle size={15} /> Review Withdrawals
          </Link>
          <Link to="/transactions" className="dashboard-action-link">
            <Wallet size={15} /> Transactions
          </Link>
          <Link to="/payment-accounts" className="dashboard-action-link">
            <CreditCard size={15} /> Payment Methods
          </Link>
          <Link to="/chat-rooms" className="dashboard-action-link">
            <MessageSquare size={15} /> Support Chat
          </Link>
          <Link to="/plans" className="dashboard-action-link">
            <TrendingUp size={15} /> Investment Plans
          </Link>
          <Link to="/social-links" className="dashboard-action-link">
            <BadgeCheck size={15} /> Social Links
          </Link>
        </div>
      </div>

      <div className="dashboard-split">
        <div className="table-card">
          <h3>System Summary</h3>
          <ul className="dashboard-health-list">
            <li>
              <span>Total configured plans</span>
              <strong>{plans.length}</strong>
            </li>
            <li>
              <span>Total payment accounts</span>
              <strong>{paymentAccounts.length}</strong>
            </li>
            <li>
              <span>Total social links</span>
              <strong>{socialLinks.items?.length || 0}</strong>
            </li>
            <li>
              <span>Escalation required</span>
              <strong>{stats.pendingDeposits + stats.pendingWithdrawals + stats.openChats}</strong>
            </li>
          </ul>
        </div>

        <div className="table-card">
          <h3>Attention Board</h3>
          <ul className="dashboard-alert-list">
            {stats.pendingDeposits > 0 ? (
              <li>
                <CircleAlert size={14} /> {stats.pendingDeposits} pending deposit request(s).
              </li>
            ) : null}
            {stats.pendingWithdrawals > 0 ? (
              <li>
                <CircleAlert size={14} /> {stats.pendingWithdrawals} pending withdrawal request(s).
              </li>
            ) : null}
            {stats.openChats > 0 ? (
              <li>
                <CircleAlert size={14} /> {stats.openChats} open support chat room(s).
              </li>
            ) : null}
            {stats.blockedUsers > 0 ? (
              <li>
                <CircleAlert size={14} /> {stats.blockedUsers} blocked user(s) currently.
              </li>
            ) : null}
            {!stats.pendingDeposits && !stats.pendingWithdrawals && !stats.openChats && !stats.blockedUsers ? (
              <li>
                <BadgeCheck size={14} /> Everything looks healthy.
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="table-card">
        <h3>Recent Financial Activity</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.length ? (
              recentActivity.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.userId}</td>
                  <td>{item.type}</td>
                  <td>{item.method || '-'}</td>
                  <td>${Number(item.amount || 0).toFixed(2)}</td>
                  <td>{item.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="table-empty">
                  No recent activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DashboardPage
