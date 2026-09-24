import { motion } from 'motion/react'
import { useState } from 'react'
import { FaGem } from 'react-icons/fa6'
import { FiArrowUpRight, FiClock, FiDollarSign, FiTrendingUp, FiShield, FiZap, FiLock, FiHeadphones, FiCheckCircle, FiInfo } from 'react-icons/fi'
import { RiCheckboxCircleFill, RiRocket2Line, RiVipCrownLine } from 'react-icons/ri'
import { IoFlashOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { API_BASE } from '../lib/api.js'

const toAssetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('/images/') || path.startsWith('images/')) {
    const base = import.meta.env.BASE_URL || '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${base}${cleanPath}`
  }
  if (path.includes('/plan-logos/') || path.includes('/bank-logos/')) {
    const fileName = path.split('/').filter(Boolean).pop()
    const folder = path.includes('/plan-logos/') ? 'plan-logos' : 'bank-logos'
    const base = import.meta.env.BASE_URL || '/'
    return `${base}${folder}/${fileName}`
  }
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/uploads/')) {
    const base = API_BASE.replace(/\/api\/?$/, '')
    return `${base}${path}`
  }
  const base = API_BASE.replace(/\/api\/?$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function InvestmentPlansPage() {
  const { investmentPlans, invest, user } = useAppContext()
  const [draft, setDraft] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  let isDark = true
  try {
    const themeCtx = useTheme()
    if (themeCtx && themeCtx.theme) {
      isDark = themeCtx.theme === 'dark'
    }
  } catch {
    isDark = true
  }

  const iconMap = { starter: IoFlashOutline, professional: RiVipCrownLine, elite: RiRocket2Line }
  const toneMap = {
    starter: 'starter',
    professional: 'pro',
    elite: 'elite',
  }

  const planCoverImage = (plan) => {
    const slug = String(plan?.slug || '').toLowerCase()
    const name = String(plan?.name || '').toLowerCase()
    const id = String(plan?.id || '').toLowerCase()

    if (slug.includes('pro') || id.includes('pro') || name.includes('professional') || name.includes('crypto')) {
      return toAssetUrl('/images/fair_pro_v2.png?v=2')
    }
    if (slug.includes('elite') || id.includes('elite') || name.includes('elite') || name.includes('solar') || name.includes('energy')) {
      return toAssetUrl('/images/fair_elite_v2.png?v=2')
    }
    if (slug.includes('starter') || id.includes('starter') || name.includes('starter') || name.includes('beginner')) {
      return toAssetUrl('/images/fair_starter_v2.png?v=2')
    }

    if (plan?.imagePath && !plan.imagePath.includes('worker_site') && !plan.imagePath.includes('crypto_trading') && !plan.imagePath.includes('solar_energy')) {
      return toAssetUrl(plan.imagePath)
    }

    return toAssetUrl('/images/fair_starter_v2.png?v=2')
  }

  const quickInvest = (plan) => {
    setDraft({
      plan,
      amount: String(Number(plan.minAmount || 0)),
    })
  }

  const confirmInvest = async () => {
    if (!draft?.plan) return
    const { plan } = draft
    const minAmount = Number(plan.minAmount || 0)
    const maxAmount = plan.maxAmount ? Number(plan.maxAmount) : null
    const amount = Number(draft.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Please enter a valid investment amount')
      return
    }
    if (amount < minAmount) {
      toast.error(`Minimum investment for this plan is $${minAmount.toFixed(2)}`)
      return
    }
    if (maxAmount !== null && amount > maxAmount) {
      toast.error(`Maximum investment for this plan is $${maxAmount.toFixed(2)}`)
      return
    }

    setSubmitting(true)
    const response = await invest(plan.id, amount)
    setSubmitting(false)

    if (response.ok) toast.success(response.message)
    else toast.error(response.message)
    if (response.ok) setDraft(null)
  }

  // Live Payout Calculation inside Investment Confirmation Dialog
  const calculateEstimates = () => {
    if (!draft?.plan) return { dailyEarn: 0, totalReturnVal: 0, netProfit: 0 }
    const amt = Number(draft.amount) || 0
    const dailyEarn = (amt * Number(draft.plan.dailyReturn || 0)) / 100
    const totalReturnVal = (amt * Number(draft.plan.totalReturn || 0)) / 100
    const netProfit = totalReturnVal - amt
    return {
      dailyEarn: Number.isFinite(dailyEarn) ? dailyEarn : 0,
      totalReturnVal: Number.isFinite(totalReturnVal) ? totalReturnVal : 0,
      netProfit: Number.isFinite(netProfit) ? netProfit : 0,
    }
  }

  const estimates = calculateEstimates()

  return (
    <section className="page-grid investment-page">
      {/* Header Banner */}
      <div
        className="glass-card plans-header"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(6, 182, 212, 0.16) 50%, rgba(16, 185, 129, 0.16) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(2, 132, 199, 0.08) 50%, rgba(16, 185, 129, 0.08) 100%)',
          border: isDark ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid rgba(2, 132, 199, 0.15)',
          boxShadow: isDark ? '0 12px 32px rgba(2, 6, 23, 0.4)' : '0 8px 24px rgba(2, 132, 199, 0.08)',
          padding: '1.6rem 1.5rem',
          borderRadius: '20px',
        }}
      >
        <span className="pill-badge" style={{ marginBottom: '0.65rem' }}>
          <FiTrendingUp size={14} /> Institutional Investment Portfolios
        </span>
        <h2 className="page-title" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800 }}>
          Choose Your FairInvest Plan
        </h2>
        <p className="muted" style={{ maxWidth: '64ch', margin: '0.4rem auto 0', lineHeight: 1.5 }}>
          Select a high-yield institutional growth plan tailored to your financial targets. Enjoy automated daily returns with transparent profit allocation.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginTop: '1.1rem',
          }}
        >
          <span className="pill-badge cyan" style={{ fontSize: '0.78rem' }}>
            <FiZap size={12} /> Daily Auto Payouts
          </span>
          <span className="pill-badge violet" style={{ fontSize: '0.78rem' }}>
            <FiShield size={12} /> Institutional Security
          </span>
          <span className="pill-badge" style={{ fontSize: '0.78rem' }}>
            <FiCheckCircle size={12} /> Zero Hidden Fees
          </span>
        </div>
      </div>

      {/* Plans Cards Grid */}
      <div className="plans-grid">
        {investmentPlans.map((plan, index) => {
          const PlanIcon = iconMap[plan.slug] || FiTrendingUp
          const coverImage = planCoverImage(plan)
          const isPopular = Boolean(plan.popular)

          return (
            <motion.article
              key={plan.id}
              className={`glass-card plan-card-modern ${toneMap[plan.slug]} ${isPopular ? 'popular' : ''}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {isPopular && (
                <div className="plan-popular-tag">
                  MOST POPULAR
                </div>
              )}

              {/* Cover Image Header */}
              <div className="plan-cover-wrap">
                <img className="plan-cover-img" src={coverImage} alt={plan.name} loading="lazy" />
                <div className="plan-cover-overlay">
                  <div className="plan-cover-top">
                    <span className="plan-icon-badge">
                      <PlanIcon size={18} />
                    </span>
                    <span className="plan-daily-badge">
                      <FiZap size={13} /> {plan.dailyReturn}% Daily ROI
                    </span>
                  </div>
                  <div className="plan-cover-bottom">
                    <h3 className="plan-title-heading">{plan.name}</h3>
                  </div>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="plan-body">
                {/* 4-Stat Grid */}
                <div className="plan-stats-grid">
                  <div className="plan-stat-box">
                    <span className="plan-stat-label">Min Deposit</span>
                    <strong className="plan-stat-value">${Number(plan.minAmount).toLocaleString()}</strong>
                  </div>
                  <div className="plan-stat-box">
                    <span className="plan-stat-label">Max Deposit</span>
                    <strong className="plan-stat-value">{plan.maxAmount ? `$${Number(plan.maxAmount).toLocaleString()}` : 'Unlimited'}</strong>
                  </div>
                  <div className="plan-stat-box">
                    <span className="plan-stat-label">Duration</span>
                    <strong className="plan-stat-value">{plan.durationDays} Days</strong>
                  </div>
                  <div className="plan-stat-box highlight">
                    <span className="plan-stat-label">Total Yield</span>
                    <strong className="plan-stat-value yield-accent">{plan.totalReturn}%</strong>
                  </div>
                </div>

                {/* Feature List */}
                <ul className="plan-feature-list">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <RiCheckboxCircleFill size={16} className="feature-check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  className={`plan-cta-btn ${toneMap[plan.slug]}`}
                  onClick={() => quickInvest(plan)}
                >
                  Invest Now <FiArrowUpRight size={18} />
                </button>
              </div>
            </motion.article>
          )
        })}
      </div>

      {/* Why Choose FairInvest Section */}
      <div
        className="glass-card info-block plans-why"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(6, 182, 212, 0.12))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(224, 242, 254, 0.8))',
          border: isDark ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid rgba(2, 132, 199, 0.15)',
          borderRadius: '20px',
        }}
      >
        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '1rem' }}>Why Choose FairInvest?</h3>
        <div className="why-grid">
          <p style={{ margin: 0, fontWeight: 600 }}>
            <RiCheckboxCircleFill size={18} style={{ color: '#10b981' }} />
            Institutional risk management & audited smart contracts
          </p>
          <p style={{ margin: 0, fontWeight: 600 }}>
            <RiCheckboxCircleFill size={18} style={{ color: '#10b981' }} />
            Consistent daily earnings credited directly to wallet balance
          </p>
          <p style={{ margin: 0, fontWeight: 600 }}>
            <RiCheckboxCircleFill size={18} style={{ color: '#10b981' }} />
            24/7 dedicated support & institutional VIP consultation
          </p>
          <p style={{ margin: 0, fontWeight: 600 }}>
            <RiCheckboxCircleFill size={18} style={{ color: '#10b981' }} />
            Instant multi-chain deposit & instant withdrawal processing
          </p>
        </div>
      </div>

      {/* Institutional Disclaimer Strip */}
      <div
        className="disclaimer-strip"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.1), rgba(16, 185, 129, 0.08))'
            : 'linear-gradient(135deg, rgba(254, 240, 138, 0.6), rgba(209, 250, 229, 0.6))',
          border: isDark ? '1px solid rgba(250, 204, 21, 0.25)' : '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          fontSize: '0.86rem',
          color: isDark ? '#fef08a' : '#854d0e',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <FiInfo size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>FairInvest Transparency Guarantee:</strong> Returns are calculated and credited automatically every 24 hours. Your principal capital remains fully protected under our tier reserve protocols.
        </span>
      </div>

      {/* Interactive Confirmation Modal with Payout Calculator */}
      {draft ? (
        <div className="invest-dialog-backdrop" onClick={() => setDraft(null)}>
          <div
            className="invest-dialog-card"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(480px, 94vw)',
              borderRadius: '20px',
              padding: '1.4rem',
              background: isDark
                ? 'linear-gradient(160deg, #0f172a 0%, #07152b 100%)'
                : 'linear-gradient(160deg, #ffffff 0%, #f0f9ff 100%)',
              border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(2, 132, 199, 0.2)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Confirm Investment</h3>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: isDark ? 'rgba(6, 182, 212, 0.2)' : 'rgba(2, 132, 199, 0.12)',
                  color: isDark ? '#38bdf8' : '#0284c7',
                }}
              >
                {draft.plan.name}
              </span>
            </div>

            <p className="muted small" style={{ margin: '0 0 0.85rem' }}>
              Minimum: <strong>${Number(draft.plan.minAmount || 0).toFixed(2)}</strong>
              {draft.plan.maxAmount ? ` | Maximum: $${Number(draft.plan.maxAmount).toFixed(2)}` : ' | Unlimited'}
            </p>

            <div style={{ display: 'grid', gap: '0.35rem', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700 }}>Enter Investment Amount (USD)</label>
              <div className="input-wrap cyan" style={{ height: '48px', borderRadius: '12px' }}>
                <FiDollarSign size={18} />
                <input
                  type="number"
                  min={Number(draft.plan.minAmount || 0)}
                  step="0.01"
                  value={draft.amount}
                  onChange={(e) => setDraft((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  style={{ fontSize: '1.05rem', fontWeight: 700 }}
                />
              </div>
              <p className="muted small" style={{ margin: '2px 0 0' }}>
                Current Wallet Balance: <strong>${Number(user.balance || 0).toFixed(2)}</strong>
              </p>
            </div>

            {/* Live Yield & Profit Estimation Box */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.08)',
                display: 'grid',
                gap: '0.45rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <span className="muted">Daily Distribution ({draft.plan.dailyReturn}%):</span>
                <strong style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>${estimates.dailyEarn.toFixed(2)} / day</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <span className="muted">Net Profit Expectation:</span>
                <strong style={{ color: isDark ? '#34d399' : '#047857' }}>+${estimates.netProfit.toFixed(2)}</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.94rem',
                  paddingTop: '0.35rem',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.08)',
                  marginTop: '0.2rem',
                }}
              >
                <span style={{ fontWeight: 700 }}>Total Contract Payout:</span>
                <strong style={{ fontSize: '1.05rem', color: isDark ? '#34d399' : '#047857', fontWeight: 800 }}>
                  ${estimates.totalReturnVal.toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="plan-actions" style={{ gap: '0.6rem' }}>
              <button
                className="mini-btn"
                onClick={() => setDraft(null)}
                disabled={submitting}
                style={{ height: '44px', borderRadius: '10px', padding: '0 1rem' }}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={confirmInvest}
                disabled={submitting}
                style={{
                  height: '44px',
                  borderRadius: '10px',
                  padding: '0 1.25rem',
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  fontWeight: 700,
                }}
              >
                {submitting ? 'Processing Capital Allocation...' : 'Confirm & Invest Now'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default InvestmentPlansPage
