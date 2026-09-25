import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import {
  Activity,
  ArrowUpRight,
  DollarSign,
  Lock,
  Users,
  Wallet,
  ShieldCheck,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronRight,
  PieChart,
  Zap,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppContext } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

function buildChartData(transactions = [], balance = 0, isDark = true) {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const monthlyEarnings = monthLabels.map((month) => ({ month, earnings: 0 }))
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  safeTransactions.forEach((txn) => {
    const date = new Date(txn.date)
    if (Number.isNaN(date.getTime())) return
    const monthIndex = date.getMonth()
    if (monthIndex < 0 || monthIndex > 5) return
    if (txn.rawType === 'commission' || txn.rawType === 'earning') {
      monthlyEarnings[monthIndex].earnings += Number(txn.amount || 0)
    }
  })

  const baseBalance = Math.max(10, Number(balance || 0))
  const multipliers = [0.25, 0.42, 0.58, 0.75, 0.88, 1.0]
  const targetMultipliers = [0.30, 0.48, 0.65, 0.82, 0.95, 1.12]

  const growthData = monthLabels.map((month, index) => {
    const earnedSoFar = monthlyEarnings.slice(0, index + 1).reduce((sum, m) => sum + m.earnings, 0)
    const actualVal = Number((baseBalance * multipliers[index] + earnedSoFar + (index * 15)).toFixed(2))
    const targetVal = Number((baseBalance * targetMultipliers[index] + (index * 20)).toFixed(2))
    return {
      month,
      growth: actualVal,
      target: targetVal,
      earnings: monthlyEarnings[index].earnings,
    }
  })

  const allocationData = [
    { name: 'Crypto Yield Vaults', value: 45, color: isDark ? '#84a95a' : '#10b981', apy: '6.2%' },
    { name: 'Institutional Arbitrage', value: 30, color: isDark ? '#6b8d40' : '#06b6d4', apy: '4.8%' },
    { name: 'Staking & Liquidity Pools', value: 25, color: isDark ? '#9bc268' : '#8b5cf6', apy: '5.5%' },
  ]

  return { growthData, monthlyEarnings, allocationData }
}

function CustomChartTooltip({ active, payload, label, isDark }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: isDark ? 'rgba(18, 24, 18, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(2, 132, 199, 0.25)',
          borderRadius: '14px',
          padding: '10px 14px',
          boxShadow: isDark ? '0 12px 32px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(15, 23, 42, 0.12)',
          color: isDark ? '#f0f4ef' : '#0f172a',
          fontSize: '0.86rem',
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, opacity: 0.85 }}>{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ margin: '4px 0 0', fontWeight: 800, color: entry.color, fontSize: '0.95rem' }}>
            {entry.name}: ${Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function CustomPieTooltip({ active, payload, isDark }) {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div
        style={{
          background: isDark ? 'rgba(18, 24, 18, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          border: `1px solid ${data.payload.color}`,
          borderRadius: '12px',
          padding: '8px 12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          color: isDark ? '#f0f4ef' : '#0f172a',
          fontSize: '0.85rem',
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, color: data.payload.color }}>{data.name}</p>
        <p style={{ margin: '3px 0 0', fontWeight: 800 }}>
          {data.value}% Share | Daily Yield: {data.payload.apy}
        </p>
      </div>
    )
  }
  return null
}

function DashboardPage() {
  const {
    user = {},
    transactions = [],
    referralCount = 0,
    referralEarnings = 0,
    investments = [],
    deposits = [],
    withdrawals = [],
  } = useAppContext() || {}

  let isDark = true
  try {
    const themeCtx = useTheme()
    if (themeCtx && themeCtx.theme) {
      isDark = themeCtx.theme === 'dark'
    }
  } catch {
    isDark = true
  }

  const safeUser = user || {}
  const { growthData, allocationData } = buildChartData(transactions, safeUser.balance || 0, isDark)
  const lockedDepositBalance = Number(safeUser.lockedBalance || 0)
  const withdrawableBalance = Math.max(0, Number(safeUser.balance || 0) - lockedDepositBalance)

  const monitor = useMemo(() => {
    const totalInvested = investments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const activeInvested = investments
      .filter((item) => item.status === 'active')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const totalExpectedReturn = investments.reduce((sum, item) => sum + Number(item.expectedReturn || 0), 0)
    const totalDeposits = deposits.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const totalWithdrawn = withdrawals.reduce((sum, item) => {
      const parsed = Number(String(item.amount || '0').replace(/[^0-9.-]/g, ''))
      return sum + Math.abs(Number.isFinite(parsed) ? parsed : 0)
    }, 0)
    const totalProfitCredited = transactions
      .filter((item) => item.rawType === 'earning' || item.rawType === 'commission')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    return {
      totalInvested,
      activeInvested,
      totalExpectedReturn,
      totalDeposits,
      totalWithdrawn,
      totalProfitCredited,
      activePlans: investments.filter((item) => item.status === 'active').length,
      completedPlans: investments.filter((item) => item.status === 'completed').length,
      pendingWithdrawals: withdrawals.filter((item) => item.status === 'pending').length,
    }
  }, [investments, deposits, withdrawals, transactions])

  const cards = [
    {
      label: 'Withdrawable Balance',
      value: `$${withdrawableBalance.toFixed(2)}`,
      icon: Wallet,
      tone: 'success',
      change: '+0.0%',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(132, 169, 90, 0.22) 0%, rgba(18, 24, 18, 0.95) 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f3f7f0 50%, #e6f0e0 100%)',
      borderColor: isDark ? 'rgba(132, 169, 90, 0.35)' : 'rgba(122, 159, 76, 0.3)',
      iconBg: isDark ? 'linear-gradient(135deg, #7a9f4c, #5e7e37)' : 'linear-gradient(135deg, #5e7e37, #7a9f4c)',
    },
    {
      label: 'Active Investments',
      value: safeUser.activeInvestments || 0,
      icon: Activity,
      tone: 'info',
      change: 'Live',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(112, 151, 68, 0.2) 0%, rgba(18, 24, 18, 0.95) 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f1f8f4 50%, #dff0e7 100%)',
      borderColor: isDark ? 'rgba(112, 151, 68, 0.3)' : 'rgba(74, 118, 96, 0.3)',
      iconBg: isDark ? 'linear-gradient(135deg, #6b8d40, #4d6928)' : 'linear-gradient(135deg, #386b54, #529677)',
    },
    {
      label: 'Total Earnings',
      value: `$${Number(safeUser.totalEarnings || 0).toFixed(2)}`,
      icon: DollarSign,
      tone: 'violet',
      change: '+8.2%',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(155, 194, 104, 0.22) 0%, rgba(18, 24, 18, 0.95) 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f6f0 50%, #eee8d5 100%)',
      borderColor: isDark ? 'rgba(155, 194, 104, 0.35)' : 'rgba(140, 110, 40, 0.3)',
      iconBg: isDark ? 'linear-gradient(135deg, #84a95a, #5e7e37)' : 'linear-gradient(135deg, #8c6e28, #b89438)',
    },
    {
      label: 'Referrals',
      value: referralCount,
      icon: Users,
      tone: 'rose',
      change: 'View tree',
      to: '/referral-tree',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(225, 82, 99, 0.18) 0%, rgba(18, 24, 18, 0.95) 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #faf3f5 50%, #f5e4e8 100%)',
      borderColor: isDark ? 'rgba(225, 82, 99, 0.3)' : 'rgba(180, 80, 100, 0.3)',
      iconBg: isDark ? 'linear-gradient(135deg, #e15263, #c0394b)' : 'linear-gradient(135deg, #a84255, #c85a70)',
    },
    {
      label: 'Locked Deposits',
      value: `$${lockedDepositBalance.toFixed(2)}`,
      icon: Lock,
      tone: 'info',
      change: 'Frozen',
      gradient: isDark
        ? 'linear-gradient(135deg, rgba(100, 116, 139, 0.2) 0%, rgba(18, 24, 18, 0.95) 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f4f6f4 50%, #e2e8e2 100%)',
      borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 120, 100, 0.25)',
      iconBg: isDark ? 'linear-gradient(135deg, #5a6878, #404c58)' : 'linear-gradient(135deg, #526352, #3d4a3d)',
    },
  ]

  const portfolioItems = [
    {
      label: 'Total Invested',
      value: `$${monitor.totalInvested.toFixed(2)}`,
      icon: PieChart,
      color: isDark ? '#9bc268' : '#5e7e37',
      bg: isDark ? 'rgba(132, 169, 90, 0.14)' : 'rgba(122, 159, 76, 0.14)',
      borderColor: isDark ? 'rgba(132, 169, 90, 0.25)' : 'rgba(122, 159, 76, 0.25)',
    },
    {
      label: 'Active Investment Amount',
      value: `$${monitor.activeInvested.toFixed(2)}`,
      icon: TrendingUp,
      color: isDark ? '#84a95a' : '#4d6928',
      bg: isDark ? 'rgba(112, 151, 68, 0.14)' : 'rgba(77, 105, 40, 0.12)',
      borderColor: isDark ? 'rgba(112, 151, 68, 0.25)' : 'rgba(77, 105, 40, 0.22)',
    },
    {
      label: 'Total Profit Credited',
      value: `$${monitor.totalProfitCredited.toFixed(2)}`,
      icon: DollarSign,
      color: isDark ? '#9bc268' : '#5e7e37',
      bg: isDark ? 'rgba(132, 169, 90, 0.22)' : 'rgba(122, 159, 76, 0.18)',
      borderColor: isDark ? 'rgba(132, 169, 90, 0.45)' : 'rgba(122, 159, 76, 0.35)',
      highlight: true,
    },
    {
      label: 'Expected Return (All Plans)',
      value: `$${monitor.totalExpectedReturn.toFixed(2)}`,
      icon: Zap,
      color: isDark ? '#b5d68d' : '#6b8d40',
      bg: isDark ? 'rgba(181, 214, 141, 0.14)' : 'rgba(107, 141, 64, 0.14)',
      borderColor: isDark ? 'rgba(181, 214, 141, 0.25)' : 'rgba(107, 141, 64, 0.25)',
    },
    {
      label: 'Total Deposits',
      value: `$${monitor.totalDeposits.toFixed(2)}`,
      icon: ArrowDownToLine,
      color: isDark ? '#84a95a' : '#5e7e37',
      bg: isDark ? 'rgba(132, 169, 90, 0.14)' : 'rgba(122, 159, 76, 0.14)',
      borderColor: isDark ? 'rgba(132, 169, 90, 0.25)' : 'rgba(122, 159, 76, 0.25)',
    },
    {
      label: 'Total Withdrawals Requested',
      value: `$${monitor.totalWithdrawn.toFixed(2)}`,
      icon: ArrowUpFromLine,
      color: isDark ? '#fb7185' : '#e11d48',
      bg: isDark ? 'rgba(251, 113, 133, 0.12)' : 'rgba(225, 29, 72, 0.08)',
      borderColor: isDark ? 'rgba(251, 113, 133, 0.25)' : 'rgba(225, 29, 72, 0.18)',
    },
    {
      label: 'Active Plans',
      value: monitor.activePlans,
      icon: Layers,
      color: isDark ? '#9bc268' : '#4d6928',
      bg: isDark ? 'rgba(155, 194, 104, 0.16)' : 'rgba(77, 105, 40, 0.14)',
      borderColor: isDark ? 'rgba(155, 194, 104, 0.3)' : 'rgba(77, 105, 40, 0.25)',
    },
    {
      label: 'Completed Plans',
      value: monitor.completedPlans,
      icon: CheckCircle2,
      color: isDark ? '#9ca899' : '#526352',
      bg: isDark ? 'rgba(156, 168, 153, 0.12)' : 'rgba(82, 99, 82, 0.1)',
      borderColor: isDark ? 'rgba(156, 168, 153, 0.25)' : 'rgba(82, 99, 82, 0.2)',
    },
    {
      label: 'Pending Withdrawals',
      value: monitor.pendingWithdrawals,
      icon: Clock,
      color: monitor.pendingWithdrawals > 0 ? (isDark ? '#facc15' : '#d97706') : (isDark ? '#9ca899' : '#526352'),
      bg: monitor.pendingWithdrawals > 0 ? (isDark ? 'rgba(250, 204, 21, 0.14)' : 'rgba(217, 119, 6, 0.1)') : (isDark ? 'rgba(156, 168, 153, 0.12)' : 'rgba(82, 99, 82, 0.1)'),
      borderColor: monitor.pendingWithdrawals > 0 ? (isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(217, 119, 6, 0.25)') : (isDark ? 'rgba(156, 168, 153, 0.25)' : 'rgba(82, 99, 82, 0.2)'),
    },
  ]

  const getTxIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownToLine size={16} style={{ color: isDark ? '#84a95a' : '#5e7e37' }} />
      case 'withdraw':
        return <ArrowUpFromLine size={16} style={{ color: '#ef4444' }} />
      case 'earning':
      case 'commission':
        return <Zap size={16} style={{ color: isDark ? '#9bc268' : '#7a9f4c' }} />
      default:
        return <Activity size={16} style={{ color: isDark ? '#7a9f4c' : '#6b8d40' }} />
    }
  }

  return (
    <section className="page-grid" style={{ gap: '1.25rem' }}>
      {/* Hero Welcome Banner */}
      <div
        className="glass-card hero-welcome-card"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(16, 22, 16, 0.96) 0%, rgba(122, 159, 76, 0.18) 60%, rgba(94, 126, 55, 0.15) 100%)'
            : 'radial-gradient(ellipse at 15% 15%, rgba(132, 169, 90, 0.18) 0%, transparent 45%), linear-gradient(135deg, #ffffff 0%, #f4f8f2 60%, #e6f0e0 100%)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.28)',
          boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(94, 126, 55, 0.12)',
          position: 'relative',
          overflow: 'hidden',
          padding: '1.5rem 1.6rem',
          borderRadius: '22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h2 className="page-title" style={{ margin: 0, color: isDark ? '#f0f4ef' : '#141e14', fontWeight: 800, fontSize: '1.75rem' }}>
                Welcome back, <span style={{ color: isDark ? '#9bc268' : '#5e7e37' }}>{user.name.split(' ')[0]}</span>!
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: isDark ? 'rgba(132, 169, 90, 0.18)' : 'rgba(122, 159, 76, 0.16)',
                  color: isDark ? '#9bc268' : '#5e7e37',
                  border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.3)',
                  boxShadow: '0 2px 8px rgba(132, 169, 90, 0.15)',
                }}
              >
                <ShieldCheck size={14} /> Institutional VIP
              </span>
            </div>
            <p className="dashboard-subtitle" style={{ margin: 0, color: isDark ? '#9ca899' : '#526352', fontWeight: 500, fontSize: '0.95rem' }}>
              Here&apos;s a live real-time summary of your FairInvest asset portfolio and yields today.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '0.7rem 1.2rem',
                borderRadius: '16px',
                background: isDark ? 'rgba(20, 28, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.25)',
                boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(94, 126, 55, 0.08)',
                textAlign: 'right',
                minWidth: '130px',
              }}
            >
              <p className="small" style={{ margin: 0, color: isDark ? '#9ca899' : '#526352', fontWeight: 600 }}>Net Wallet Balance</p>
              <strong style={{ fontSize: '1.35rem', color: isDark ? '#9bc268' : '#5e7e37', fontWeight: 800, display: 'block', marginTop: '2px' }}>
                ${Number(user.balance || 0).toFixed(2)}
              </strong>
            </div>
            <div
              style={{
                padding: '0.7rem 1.2rem',
                borderRadius: '16px',
                background: isDark ? 'rgba(20, 28, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.25)',
                boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(94, 126, 55, 0.08)',
                textAlign: 'right',
                minWidth: '130px',
              }}
            >
              <p className="small" style={{ margin: 0, color: isDark ? '#9ca899' : '#526352', fontWeight: 600 }}>Total Earnings</p>
              <strong style={{ fontSize: '1.35rem', color: isDark ? '#84a95a' : '#4d6928', fontWeight: 800, display: 'block', marginTop: '2px' }}>
                ${Number(user.totalEarnings || 0).toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="metrics-grid">
        {cards.map((item) => {
          const body = (
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              <div className="metric-head" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span
                    className="icon-box"
                    style={{
                      background: item.iconBg,
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <item.icon size={18} />
                  </span>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                    {item.label}
                  </p>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '999px',
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                    color: isDark ? '#38bdf8' : '#0284c7',
                  }}
                >
                  <ArrowUpRight size={12} /> {item.change}
                </span>
              </div>
              <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#ffffff' : '#0f172a' }}>
                {item.value}
              </h3>
            </div>
          )

          const cardStyle = {
            background: item.gradient,
            border: `1px solid ${item.borderColor}`,
            boxShadow: isDark ? '0 8px 24px rgba(2, 6, 23, 0.3)' : '0 6px 20px rgba(15, 23, 42, 0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: item.to ? 'pointer' : 'default',
            borderRadius: '18px',
            padding: '1.15rem',
          }

          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={`glass-card metric metric-link ${item.tone}`} style={cardStyle}>
                {body}
              </Link>
            )
          }
          return (
            <article key={item.label} className={`glass-card metric ${item.tone}`} style={cardStyle}>
              {body}
            </article>
          )
        })}
      </div>

      {/* Analytics & Performance Charts */}
      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Chart 1: Composed Growth & Target Trajectory */}
        <article className="glass-card chart-card" style={{ padding: '1.35rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: isDark ? '#9bc268' : '#059669' }} /> Portfolio Yield Curve
            </h3>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#84a95a' : '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '99px', background: isDark ? '#84a95a' : '#059669' }}></span> Actual
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#b5d68d' : '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '99px', background: isDark ? '#b5d68d' : '#0284c7' }}></span> Target
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <ComposedChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGrowthCurve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? '#84a95a' : '#0284c7'} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={isDark ? '#84a95a' : '#0284c7'} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(132, 169, 90, 0.12)' : 'rgba(15, 23, 42, 0.08)'} />
              <XAxis dataKey="month" stroke={isDark ? '#9ca899' : '#475569'} tick={{ fontSize: 12, fontWeight: 700, fill: isDark ? '#9ca899' : '#475569' }} />
              <YAxis stroke={isDark ? '#9ca899' : '#475569'} tick={{ fontSize: 12, fontWeight: 700, fill: isDark ? '#9ca899' : '#475569' }} />
              <Tooltip content={<CustomChartTooltip isDark={isDark} />} />
              <Area
                type="monotone"
                dataKey="growth"
                name="Actual Growth"
                stroke={isDark ? '#84a95a' : '#0284c7'}
                strokeWidth={3}
                fill="url(#colorGrowthCurve)"
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target Benchmark"
                stroke={isDark ? '#b5d68d' : '#2563eb'}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: isDark ? '#b5d68d' : '#2563eb' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </article>

        {/* Chart 2: Asset Allocation Donut Chart */}
        <article className="glass-card chart-card" style={{ padding: '1.35rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={20} style={{ color: isDark ? '#9bc268' : '#0284c7' }} /> Asset Allocation & Yields
            </h3>
            <span className="small" style={{ fontWeight: 700, color: isDark ? '#9bc268' : '#0284c7', background: isDark ? 'rgba(132, 169, 90, 0.18)' : 'rgba(2, 132, 199, 0.08)', padding: '3px 10px', borderRadius: '999px' }}>Live Portfolio</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Tooltip content={<CustomPieTooltip isDark={isDark} />} />
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#121812' : '#ffffff'} strokeWidth={2} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
              {/* Center Stat */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#9ca899' : '#64748b' }}>TOTAL</p>
                <strong style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#0f172a' }}>
                  ${Number(user.balance || 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {allocationData.map((item) => (
                <div
                  key={item.name}
                  style={{
                    padding: '0.55rem 0.8rem',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(20, 28, 20, 0.9)' : 'rgba(241, 245, 249, 0.8)',
                    border: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#f0f4ef' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '99px', background: item.color }}></span> {item.name}
                    </span>
                    <strong style={{ fontSize: '0.82rem', color: item.color, fontWeight: 800 }}>{item.value}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: isDark ? '#9ca899' : '#64748b', fontWeight: 600 }}>
                    <span>Yield Rate</span>
                    <span style={{ color: isDark ? '#9bc268' : '#047857', fontWeight: 700 }}>{item.apy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* Portfolio Monitor Matrix */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '22px' }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Layers size={20} style={{ color: isDark ? '#9bc268' : '#0284c7' }} /> Portfolio Monitor
            </h3>
            <p className="small" style={{ margin: '3px 0 0', color: isDark ? '#9ca899' : '#64748b', fontWeight: 500 }}>
              Institutional capital overview & operational metrics
            </p>
          </div>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '999px',
              background: isDark ? 'rgba(132, 169, 90, 0.18)' : 'rgba(2, 132, 199, 0.08)',
              color: isDark ? '#9bc268' : '#0284c7',
              border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(2, 132, 199, 0.2)',
            }}
          >
            9 Active Indicators
          </span>
        </div>

        <div className="portfolio-monitor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {portfolioItems.map((item) => (
            <article
              key={item.label}
              className="summary-card"
              style={{
                padding: '1.1rem 1.2rem',
                borderRadius: '16px',
                background: isDark ? (item.highlight ? 'rgba(132, 169, 90, 0.22)' : 'rgba(18, 24, 18, 0.88)') : (item.highlight ? 'rgba(236, 253, 245, 0.95)' : 'rgba(255, 255, 255, 0.95)'),
                border: `1px solid ${item.borderColor}`,
                boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.35)' : '0 4px 16px rgba(15, 23, 42, 0.04)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: item.bg,
                  display: 'grid',
                  placeItems: 'center',
                  color: item.color,
                  flexShrink: 0,
                  border: `1px solid ${item.borderColor}`,
                }}
              >
                <item.icon size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="small" style={{ margin: 0, fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </p>
                <h4 style={{ margin: '0.2rem 0 0', fontSize: '1.3rem', fontWeight: 800, color: item.highlight ? item.color : (isDark ? '#ffffff' : '#0f172a') }}>
                  {item.value}
                </h4>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>Recent Transactions</h3>
            <p className="small" style={{ margin: '3px 0 0', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>Latest wallet activity & return distributions</p>
          </div>
          <Link
            className="mini-btn"
            to="/transactions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.86rem',
              fontWeight: 700,
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: '10px',
            }}
          >
            View Full History <ChevronRight size={14} />
          </Link>
        </div>

        <div className="transaction-list" style={{ display: 'grid', gap: '0.65rem' }}>
          {transactions.slice(0, 8).map((txn) => (
            <article
              key={txn.id}
              className="transaction-item"
              style={{
                padding: '0.9rem 1.1rem',
                borderRadius: '16px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(15, 23, 42, 0.08)',
                background: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {getTxIcon(txn.rawType || txn.type)}
                </div>
                <div>
                  <p className="capitalize" style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#ffffff' : '#0f172a' }}>{txn.type}</p>
                  <p className="small" style={{ margin: '2px 0 0', color: isDark ? '#94a3b8' : '#64748b' }}>{txn.date}</p>
                </div>
              </div>
              <div className="tx-right" style={{ textAlign: 'right' }}>
                <strong
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: txn.type === 'withdraw' ? '#ef4444' : (isDark ? '#34d399' : '#047857'),
                  }}
                >
                  {txn.type === 'withdraw' ? '-' : '+'}${Number(txn.amount).toFixed(2)}
                </strong>
                <span className={`status ${txn.status}`} style={{ marginTop: '3px', display: 'inline-block' }}>
                  {txn.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Quick Actions Hub */}
      <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <Link
          className="action-card emerald"
          to="/deposit"
          style={{
            textDecoration: 'none',
            padding: '1.5rem 1.4rem',
            borderRadius: '22px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(20, 30, 20, 0.95) 0%, rgba(32, 48, 32, 0.92) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f3f7f0 50%, #e6f0e0 100%)',
            color: isDark ? '#f0f4ef' : '#141e14',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.3)',
            boxShadow: isDark ? '0 14px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)' : '0 10px 28px rgba(94, 126, 55, 0.14), inset 0 1px 0 #ffffff',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '4px 11px',
                borderRadius: '999px',
                background: isDark ? 'rgba(132, 169, 90, 0.2)' : 'rgba(94, 126, 55, 0.12)',
                color: isDark ? '#9bc268' : '#5e7e37',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.25)',
              }}
            >
              Instant Fund
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 6px 16px rgba(94, 126, 55, 0.35)',
              }}
            >
              <ArrowDownToLine size={20} />
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14', letterSpacing: '-0.01em' }}>
              Make a Deposit
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: isDark ? '#9ca899' : '#526352', lineHeight: 1.5, fontWeight: 500 }}>
              Fund your wallet securely with instant multi-chain crypto & fiat support.
            </p>
          </div>
        </Link>

        <Link
          className="action-card cyan"
          to="/investment-plans"
          style={{
            textDecoration: 'none',
            padding: '1.5rem 1.4rem',
            borderRadius: '22px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(18, 28, 23, 0.95) 0%, rgba(26, 44, 36, 0.92) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f1f8f4 50%, #dff0e7 100%)',
            color: isDark ? '#f0f4ef' : '#141e14',
            border: isDark ? '1px solid rgba(74, 118, 96, 0.35)' : '1px solid rgba(54, 100, 78, 0.28)',
            boxShadow: isDark ? '0 14px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)' : '0 10px 28px rgba(54, 100, 78, 0.14), inset 0 1px 0 #ffffff',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '4px 11px',
                borderRadius: '999px',
                background: isDark ? 'rgba(74, 118, 96, 0.2)' : 'rgba(45, 90, 70, 0.12)',
                color: isDark ? '#7ab899' : '#2d5a46',
                border: isDark ? '1px solid rgba(74, 118, 96, 0.35)' : '1px solid rgba(45, 90, 70, 0.25)',
              }}
            >
              High Yield Tiers
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #386b54 0%, #529677 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 6px 16px rgba(56, 107, 84, 0.35)',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14', letterSpacing: '-0.01em' }}>
              Browse Plans
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: isDark ? '#9ca899' : '#526352', lineHeight: 1.5, fontWeight: 500 }}>
              Compare high-yield institutional investment tiers and daily return rates.
            </p>
          </div>
        </Link>

        <Link
          className="action-card violet"
          to="/referral-tree"
          style={{
            textDecoration: 'none',
            padding: '1.5rem 1.4rem',
            borderRadius: '22px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(28, 26, 18, 0.95) 0%, rgba(44, 40, 26, 0.92) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f6f0 50%, #eee8d5 100%)',
            color: isDark ? '#f0f4ef' : '#141e14',
            border: isDark ? '1px solid rgba(180, 150, 70, 0.35)' : '1px solid rgba(140, 110, 40, 0.28)',
            boxShadow: isDark ? '0 14px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)' : '0 10px 28px rgba(140, 110, 40, 0.14), inset 0 1px 0 #ffffff',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '4px 11px',
                borderRadius: '999px',
                background: isDark ? 'rgba(180, 150, 70, 0.2)' : 'rgba(140, 110, 40, 0.12)',
                color: isDark ? '#d4b055' : '#8c6e28',
                border: isDark ? '1px solid rgba(180, 150, 70, 0.35)' : '1px solid rgba(140, 110, 40, 0.25)',
              }}
            >
              VIP Network
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8c6e28 0%, #b89438 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 6px 16px rgba(140, 110, 40, 0.35)',
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14', letterSpacing: '-0.01em' }}>
              Refer & Earn
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: isDark ? '#9ca899' : '#526352', lineHeight: 1.5, fontWeight: 500 }}>
              Grow your network and unlock multi-level passive referral commissions.
            </p>
          </div>
        </Link>
      </div>

      {/* Footer Balance Summary Strip */}
      <div
        className="glass-card"
        style={{
          padding: '0.95rem 1.4rem',
          textAlign: 'center',
          borderRadius: '16px',
          background: isDark ? 'rgba(20, 28, 20, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <p className="small" style={{ margin: 0, fontWeight: 600, color: isDark ? '#9ca899' : '#475569', fontSize: '0.88rem' }}>
          Referral earnings so far: <strong style={{ color: isDark ? '#9bc268' : '#047857' }}>${referralEarnings.toFixed(2)}</strong> | Current wallet balance: <strong style={{ color: isDark ? '#84a95a' : '#0284c7' }}>${user.balance.toFixed(2)}</strong>
        </p>
      </div>
    </section>
  )
}

export default DashboardPage



