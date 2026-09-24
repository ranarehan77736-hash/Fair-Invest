import { useMemo, useState } from 'react'
import {
  ReceiptText,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  RotateCcw,
  ArrowDownToLine,
  ArrowUpFromLine,
  Zap,
  TrendingUp,
  CheckCircle2,
  Gift,
  X,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

function TransactionsPage() {
  const { transactions } = useAppContext()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return transactions.filter((txn) => {
      if (typeFilter !== 'all') {
        if (typeFilter === 'earning_all') {
          if (txn.rawType !== 'earning' && txn.rawType !== 'commission' && txn.type !== 'earning' && txn.type !== 'commission') {
            return false
          }
        } else if (txn.type !== typeFilter && txn.rawType !== typeFilter) {
          return false
        }
      }
      if (statusFilter !== 'all' && txn.status !== statusFilter) return false
      if (!keyword) return true
      return [txn.id, txn.type, txn.method, txn.status, txn.date]
        .map((item) => String(item || '').toLowerCase())
        .some((item) => item.includes(keyword))
    })
  }, [transactions, typeFilter, statusFilter, query])

  const summary = useMemo(() => {
    const earning = filtered
      .filter((txn) => txn.rawType === 'earning' || txn.rawType === 'commission' || txn.type === 'earning' || txn.type === 'commission')
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0)
    const invested = filtered
      .filter((txn) => txn.rawType === 'investment' || txn.type === 'investment')
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0)
    const withdrawn = filtered
      .filter((txn) => txn.rawType === 'withdrawal' || txn.type === 'withdraw' || txn.type === 'withdrawal')
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0)
    return { earning, invested, withdrawn }
  }, [filtered])

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success(`Copied ID ${id} to clipboard!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleExportCSV = () => {
    if (!filtered.length) {
      toast.error('No transactions available to export.')
      return
    }
    const headers = ['Transaction ID', 'Type', 'Method / Plan', 'Amount ($)', 'Status', 'Date']
    const rows = filtered.map((t) => [
      t.id,
      t.type,
      `"${t.method || ''}"`,
      Number(t.amount || 0).toFixed(2),
      t.status,
      `"${t.date || ''}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `FairInvest_Transactions_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Transaction history exported as CSV!')
  }

  const resetFilters = () => {
    setTypeFilter('all')
    setStatusFilter('all')
    setQuery('')
  }

  const getTypeBadge = (type, rawType) => {
    const t = (rawType || type || '').toLowerCase()
    if (t.includes('deposit')) {
      return {
        label: 'Deposit',
        icon: ArrowDownToLine,
        color: isDark ? '#84a95a' : '#5e7e37',
        bg: isDark ? 'rgba(132, 169, 90, 0.16)' : 'rgba(94, 126, 55, 0.12)',
        border: isDark ? 'rgba(132, 169, 90, 0.3)' : 'rgba(122, 159, 76, 0.25)',
      }
    }
    if (t.includes('withdraw')) {
      return {
        label: 'Withdrawal',
        icon: ArrowUpFromLine,
        color: '#fb7185',
        bg: 'rgba(251, 113, 133, 0.14)',
        border: 'rgba(251, 113, 133, 0.3)',
      }
    }
    if (t.includes('commission')) {
      return {
        label: 'Commission',
        icon: Gift,
        color: isDark ? '#d4b055' : '#8c6e28',
        bg: isDark ? 'rgba(180, 150, 70, 0.18)' : 'rgba(140, 110, 40, 0.12)',
        border: isDark ? 'rgba(180, 150, 70, 0.3)' : 'rgba(140, 110, 40, 0.25)',
      }
    }
    if (t.includes('earning')) {
      return {
        label: 'Yield Earning',
        icon: Zap,
        color: isDark ? '#9bc268' : '#5e7e37',
        bg: isDark ? 'rgba(155, 194, 104, 0.18)' : 'rgba(94, 126, 55, 0.14)',
        border: isDark ? 'rgba(155, 194, 104, 0.35)' : 'rgba(122, 159, 76, 0.28)',
      }
    }
    return {
      label: 'Investment',
      icon: TrendingUp,
      color: isDark ? '#7ab899' : '#2d5a46',
      bg: isDark ? 'rgba(74, 118, 96, 0.18)' : 'rgba(45, 90, 70, 0.12)',
      border: isDark ? 'rgba(74, 118, 96, 0.3)' : 'rgba(45, 90, 70, 0.25)',
    }
  }

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'completed' || s === 'success') {
      return {
        label: 'Completed',
        color: isDark ? '#4ade80' : '#16a34a',
        bg: isDark ? 'rgba(74, 222, 128, 0.14)' : 'rgba(22, 163, 74, 0.12)',
        border: isDark ? 'rgba(74, 222, 128, 0.3)' : 'rgba(22, 163, 74, 0.25)',
        dot: '#22c55e',
      }
    }
    if (s === 'pending') {
      return {
        label: 'Pending',
        color: isDark ? '#facc15' : '#d97706',
        bg: isDark ? 'rgba(250, 204, 21, 0.14)' : 'rgba(217, 119, 6, 0.12)',
        border: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(217, 119, 6, 0.25)',
        dot: '#eab308',
      }
    }
    if (s === 'processing') {
      return {
        label: 'Processing',
        color: isDark ? '#60a5fa' : '#2563eb',
        bg: isDark ? 'rgba(96, 165, 250, 0.14)' : 'rgba(37, 99, 235, 0.12)',
        border: isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(37, 99, 235, 0.25)',
        dot: '#3b82f6',
      }
    }
    return {
      label: 'Failed',
      color: '#f87171',
      bg: 'rgba(248, 113, 113, 0.14)',
      border: 'rgba(248, 113, 113, 0.3)',
      dot: '#ef4444',
    }
  }

  return (
    <section className="page-grid mobile-friendly-page" style={{ gap: '1.4rem' }}>
      {/* Hero Header Card */}
      <div
        className="glass-card"
        style={{
          padding: '1.6rem 1.8rem',
          borderRadius: '24px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(18, 24, 18, 0.96) 0%, rgba(30, 44, 30, 0.85) 100%)'
            : 'radial-gradient(ellipse at 15% 15%, rgba(132, 169, 90, 0.18) 0%, transparent 45%), linear-gradient(180deg, #ffffff 0%, #f4f8f2 60%, #e6f0e0 100%)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.3)',
          boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(94, 126, 55, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 6px 18px rgba(94, 126, 55, 0.35)',
              }}
            >
              <ReceiptText size={24} />
            </div>
            <div>
              <h2 className="page-title" style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14', letterSpacing: '-0.02em' }}>
                Transaction History
              </h2>
              <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.9rem', color: isDark ? '#9ca899' : '#526352' }}>
                Complete real-time ledger of deposits, investments, yield earnings, and withdrawals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '14px',
              background: isDark ? 'linear-gradient(135deg, #7a9f4c 0%, #5e7e37 100%)' : 'linear-gradient(135deg, #5e7e37 0%, #4d6928 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.86rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(94, 126, 55, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Quick Type Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.4rem' }}>
          {[
            { id: 'all', label: 'All Records' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'earning_all', label: 'Earnings & Commissions' },
            { id: 'investment', label: 'Investments' },
            { id: 'withdraw', label: 'Withdrawals' },
          ].map((tab) => {
            const isActive = typeFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isActive
                    ? (isDark ? '#84a95a' : '#5e7e37')
                    : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(122, 159, 76, 0.12)'),
                  color: isActive
                    ? '#ffffff'
                    : (isDark ? '#cbd5e1' : '#526352'),
                  border: isActive
                    ? '1px solid transparent'
                    : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(122, 159, 76, 0.22)'),
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search & Select Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', color: isDark ? '#9ca899' : '#526352', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by ID, method, status, date..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '42px',
                paddingRight: query ? '36px' : '14px',
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.3)',
                color: isDark ? '#f0f4ef' : '#141e14',
                fontSize: '0.88rem',
                fontWeight: 500,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: isDark ? '#9ca899' : '#526352', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            ) : null}
          </div>

          {/* Type Selector */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={17} style={{ position: 'absolute', left: '14px', color: isDark ? '#9ca899' : '#526352', pointerEvents: 'none' }} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '42px',
                paddingRight: '14px',
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.3)',
                color: isDark ? '#f0f4ef' : '#141e14',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Category Types</option>
              <option value="deposit">Deposit</option>
              <option value="investment">Investment</option>
              <option value="earning">Earning</option>
              <option value="commission">Commission</option>
              <option value="withdraw">Withdraw</option>
            </select>
          </div>

          {/* Status Selector */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <CheckCircle2 size={17} style={{ position: 'absolute', left: '14px', color: isDark ? '#9ca899' : '#526352', pointerEvents: 'none' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '42px',
                paddingRight: '14px',
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.3)',
                color: isDark ? '#f0f4ef' : '#141e14',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {query || typeFilter !== 'all' || statusFilter !== 'all' ? (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                height: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0 1rem',
                borderRadius: '14px',
                background: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} /> Reset
            </button>
          ) : null}
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <article
          className="glass-card"
          style={{
            padding: '1.2rem 1.3rem',
            borderRadius: '20px',
            background: isDark ? 'linear-gradient(135deg, rgba(20, 28, 20, 0.9) 0%, rgba(32, 48, 32, 0.8) 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f3f7f0 100%)',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.28)',
            boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 6px 20px rgba(94, 126, 55, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <p className="muted" style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: isDark ? '#9ca899' : '#526352' }}>Filtered Records</p>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isDark ? 'rgba(132, 169, 90, 0.2)' : 'rgba(94, 126, 55, 0.12)', color: isDark ? '#9bc268' : '#5e7e37', display: 'grid', placeItems: 'center' }}>
              <Layers size={18} />
            </div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
            {filtered.length} <span style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.7 }}>items</span>
          </h3>
        </article>

        <article
          className="glass-card"
          style={{
            padding: '1.2rem 1.3rem',
            borderRadius: '20px',
            background: isDark ? 'linear-gradient(135deg, rgba(20, 28, 20, 0.9) 0%, rgba(36, 48, 24, 0.8) 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f6f0 100%)',
            border: isDark ? '1px solid rgba(180, 150, 70, 0.3)' : '1px solid rgba(140, 110, 40, 0.28)',
            boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 6px 20px rgba(140, 110, 40, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <p className="muted" style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: isDark ? '#9ca899' : '#526352' }}>Earnings + Commissions</p>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isDark ? 'rgba(180, 150, 70, 0.2)' : 'rgba(140, 110, 40, 0.12)', color: isDark ? '#d4b055' : '#8c6e28', display: 'grid', placeItems: 'center' }}>
              <Zap size={18} />
            </div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#9bc268' : '#5e7e37' }}>
            ${summary.earning.toFixed(2)}
          </h3>
        </article>

        <article
          className="glass-card"
          style={{
            padding: '1.2rem 1.3rem',
            borderRadius: '20px',
            background: isDark ? 'linear-gradient(135deg, rgba(18, 28, 23, 0.9) 0%, rgba(26, 44, 36, 0.8) 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f1f8f4 100%)',
            border: isDark ? '1px solid rgba(74, 118, 96, 0.3)' : '1px solid rgba(54, 100, 78, 0.28)',
            boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 6px 20px rgba(54, 100, 78, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <p className="muted" style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: isDark ? '#9ca899' : '#526352' }}>Invested Amount</p>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isDark ? 'rgba(74, 118, 96, 0.2)' : 'rgba(45, 90, 70, 0.12)', color: isDark ? '#7ab899' : '#2d5a46', display: 'grid', placeItems: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#7ab899' : '#2d5a46' }}>
            ${summary.invested.toFixed(2)}
          </h3>
        </article>

        <article
          className="glass-card"
          style={{
            padding: '1.2rem 1.3rem',
            borderRadius: '20px',
            background: isDark ? 'linear-gradient(135deg, rgba(30, 20, 22, 0.9) 0%, rgba(48, 26, 30, 0.8) 100%)' : 'linear-gradient(135deg, #ffffff 0%, #faf3f5 100%)',
            border: isDark ? '1px solid rgba(251, 113, 133, 0.3)' : '1px solid rgba(180, 80, 100, 0.28)',
            boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 6px 20px rgba(180, 80, 100, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <p className="muted" style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: isDark ? '#9ca899' : '#526352' }}>Withdrawal Amount</p>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(251, 113, 133, 0.18)', color: '#fb7185', display: 'grid', placeItems: 'center' }}>
              <ArrowUpFromLine size={18} />
            </div>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: '#fb7185' }}>
            ${summary.withdrawn.toFixed(2)}
          </h3>
        </article>
      </div>

      {/* Main Ledger Table Card */}
      <div
        className="glass-card"
        style={{
          borderRadius: '24px',
          padding: '1.5rem',
          background: isDark ? 'rgba(18, 24, 18, 0.94)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.28)',
          boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(94, 126, 55, 0.12)',
        }}
      >
        {/* Mobile View Card List */}
        <div className="mobile-record-list">
          {filtered.length ? (
            filtered.map((txn) => {
              const typeBadge = getTypeBadge(txn.type, txn.rawType)
              const statusBadge = getStatusBadge(txn.status)
              const TypeIcon = typeBadge.icon

              return (
                <article
                  key={txn.id}
                  className="mobile-record-card"
                  style={{
                    borderRadius: '16px',
                    padding: '1.2rem',
                    marginBottom: '0.85rem',
                    background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                    border: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          color: isDark ? '#9bc268' : '#5e7e37',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: isDark ? 'rgba(132, 169, 90, 0.14)' : 'rgba(94, 126, 55, 0.1)',
                          border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.2)',
                        }}
                      >
                        {txn.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(txn.id)}
                        style={{ background: 'none', border: 'none', color: isDark ? '#9ca899' : '#526352', cursor: 'pointer', padding: '2px' }}
                      >
                        {copiedId === txn.id ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: statusBadge.color,
                        background: statusBadge.bg,
                        border: `1px solid ${statusBadge.border}`,
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: statusBadge.dot }} />
                      {statusBadge.label}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.86rem' }}>
                    <div>
                      <span className="muted small" style={{ display: 'block', fontSize: '0.74rem', marginBottom: '2px' }}>Type</span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 9px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: typeBadge.color,
                          background: typeBadge.bg,
                          border: `1px solid ${typeBadge.border}`,
                        }}
                      >
                        <TypeIcon size={13} /> {typeBadge.label}
                      </span>
                    </div>

                    <div>
                      <span className="muted small" style={{ display: 'block', fontSize: '0.74rem', marginBottom: '2px' }}>Amount</span>
                      <strong style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
                        ${Number(txn.amount || 0).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span className="muted small" style={{ display: 'block', fontSize: '0.74rem', marginBottom: '2px' }}>Method / Plan</span>
                      <span style={{ fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155' }}>{txn.method || 'Standard'}</span>
                    </div>

                    <div>
                      <span className="muted small" style={{ display: 'block', fontSize: '0.74rem', marginBottom: '2px' }}>Date</span>
                      <span style={{ color: isDark ? '#9ca899' : '#526352' }}>{txn.date}</span>
                    </div>
                  </div>
                </article>
              )
            })
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <ReceiptText size={48} style={{ color: isDark ? 'rgba(132, 169, 90, 0.4)' : 'rgba(94, 126, 55, 0.3)', marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.5rem 0', color: isDark ? '#f0f4ef' : '#141e14', fontWeight: 800 }}>No Transactions Found</h4>
              <p className="muted" style={{ margin: '0 0 1.2rem 0', fontSize: '0.9rem' }}>
                No activity records matched your filter criteria.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  padding: '8px 18px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(132, 169, 90, 0.18)' : 'rgba(94, 126, 55, 0.12)',
                  border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.28)',
                  color: isDark ? '#9bc268' : '#5e7e37',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Desktop Data Table */}
        <div className="table-wrap table-wrap--desktop">
          {filtered.length ? (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
              <thead>
                <tr style={{ color: isDark ? '#9ca899' : '#526352', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Transaction ID</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Category Type</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Method / Details</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => {
                  const typeBadge = getTypeBadge(txn.type, txn.rawType)
                  const statusBadge = getStatusBadge(txn.status)
                  const TypeIcon = typeBadge.icon

                  return (
                    <tr
                      key={txn.id}
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.025)' : '#ffffff',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* ID with copy */}
                      <td style={{ padding: '14px', borderRadius: '14px 0 0 14px', borderLeft: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)', borderTop: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)', borderBottom: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              color: isDark ? '#9bc268' : '#5e7e37',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              background: isDark ? 'rgba(132, 169, 90, 0.14)' : 'rgba(94, 126, 55, 0.1)',
                              border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.2)',
                            }}
                          >
                            {txn.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(txn.id)}
                            style={{ background: 'none', border: 'none', color: isDark ? '#9ca899' : '#526352', cursor: 'pointer', padding: '2px', display: 'grid', placeItems: 'center' }}
                            title="Copy Transaction ID"
                          >
                            {copiedId === txn.id ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '14px', borderTop: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)', borderBottom: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 11px',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: typeBadge.color,
                            background: typeBadge.bg,
                            border: `1px solid ${typeBadge.border}`,
                          }}
                        >
                          <TypeIcon size={14} /> {typeBadge.label}
                        </span>
                      </td>

                      {/* Method */}
                      <td style={{ padding: '14px', fontWeight: 600, color: isDark ? '#f0f4ef' : '#141e14', fontSize: '0.9rem', borderTop: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)', borderBottom: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)' }}>
                        {txn.method || 'Standard'}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px', fontWeight: 800, fontSize: '0.98rem', color: isDark ? '#f0f4ef' : '#141e14', borderTop: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)', borderBottom: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)' }}>
                        ${Number(txn.amount || 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px', borderTop: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)', borderBottom: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 11px',
                            borderRadius: '999px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: statusBadge.color,
                            background: statusBadge.bg,
                            border: `1px solid ${statusBadge.border}`,
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: statusBadge.dot }} />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px', borderRadius: '0 14px 14px 0', color: isDark ? '#9ca899' : '#526352', fontSize: '0.86rem', fontWeight: 500, borderRight: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)', borderTop: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)', borderBottom: isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)' }}>
                        {txn.date}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
              <ReceiptText size={52} style={{ color: isDark ? 'rgba(132, 169, 90, 0.35)' : 'rgba(94, 126, 55, 0.3)', marginBottom: '1rem' }} />
              <h4 style={{ margin: '0 0 0.5rem 0', color: isDark ? '#f0f4ef' : '#141e14', fontWeight: 800, fontSize: '1.2rem' }}>No Transactions Match Your Filter</h4>
              <p className="muted" style={{ margin: '0 0 1.25rem 0', fontSize: '0.92rem' }}>
                Try clearing your search query or selecting a different status filter.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(132, 169, 90, 0.18)' : 'rgba(94, 126, 55, 0.12)',
                  border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.28)',
                  color: isDark ? '#9bc268' : '#5e7e37',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default TransactionsPage
