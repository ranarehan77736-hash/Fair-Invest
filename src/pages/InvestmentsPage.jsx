import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeDollarSign, CalendarClock, CheckCircle2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'

function InvestmentsPage() {
  const { investments, withdrawInvestmentEarning, user } = useAppContext()
  const [selectedId, setSelectedId] = useState(null)

  const selected = useMemo(
    () => investments.find((item) => item.rawId === selectedId) || investments[0] || null,
    [investments, selectedId],
  )
  const summary = useMemo(
    () => ({
      active: investments.filter((item) => item.status === 'active').length,
      totalInvested: investments.reduce((acc, item) => acc + Number(item.amount || 0), 0),
      accrued: investments.reduce((acc, item) => acc + Number(item.accruedEarning || 0), 0),
      withdrawable: Math.max(0, Number(user.balance || 0) - Number(user.lockedBalance || 0)),
    }),
    [investments, user.balance, user.lockedBalance],
  )

  const handleClaim = async (investment) => {
    const response = await claimInvestment(investment.rawId)
    if (response.ok) toast.success(response.message)
    else toast.error(response.message)
  }

  const handleCreditProfit = async (investment) => {
    const response = await withdrawInvestmentEarning(investment.rawId)
    if (response.ok) toast.success(response.message)
    else if (String(response.message || '').toLowerCase().includes('no new daily profit')) {
      toast.info('No new 24h profit available yet for this plan.')
    } else {
      toast.error(response.message)
    }
  }

  const selectedProgress = selected ? Math.min(100, Math.max(0, Number(selected.progressPercent || 0))) : 0

  return (
    <section className="page-grid investments-page">
      <div className="glass-card investments-hero">
        <h2 className="page-title">My Investments Status</h2>
        <p className="muted">Track every running plan, understand earnings, and withdraw at the right time.</p>
        <div className="investments-hero-actions">
          <span className="muted small">Not sure what to do next? Start by selecting a plan below.</span>
          <Link to="/investment-plans" className="btn btn-outline btn-sm">
            Add New Investment <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="glass-card metric">
          <p className="muted">Active Investments</p>
          <h3>{summary.active}</h3>
        </article>
        <article className="glass-card metric">
          <p className="muted">Total Invested</p>
          <h3>${summary.totalInvested.toFixed(2)}</h3>
        </article>
        <article className="glass-card metric">
          <p className="muted">Accrued Earnings</p>
          <h3>${summary.accrued.toFixed(4)}</h3>
        </article>
        <article className="glass-card metric">
          <p className="muted">Withdrawable Now</p>
          <h3>${summary.withdrawable.toFixed(4)}</h3>
        </article>
      </div>

      {investments.length ? (
        <div className="investments-workspace">
          <div className="glass-card investments-list-panel">
            <div className="investments-list-head">
              <h3>Your Active & Completed Plans</h3>
              <span className="muted small">Select one investment to inspect details.</span>
            </div>
            <div className="investments-list">
              {investments.map((item) => {
                const progress = Math.min(100, Math.max(0, Number(item.progressPercent || 0)))
                const isSelected = selected?.rawId === item.rawId
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`investment-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedId(item.rawId)}
                  >
                    <div className="investment-row-top">
                      <div>
                        <strong>{item.planName}</strong>
                        <p className="muted small">Invested ${Number(item.amount).toFixed(2)}</p>
                      </div>
                      <span className={`status ${item.status}`}>{item.status}</span>
                    </div>
                    <div className="investment-row-progress">
                      <span className="muted small">Progress {progress.toFixed(2)}%</span>
                      <div className="progress-shell">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="investment-row-meta">
                      <p className="small">
                        Earned <strong>${Number(item.accruedEarning).toFixed(4)}</strong>
                      </p>
                      <p className="small">
                        Pending Credit <strong>${Number(item.availableEarning).toFixed(4)}</strong>
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {selected ? (
            <div className="glass-card investment-details-panel investment-focus-panel">
              <div className="investment-focus-head">
                <div>
                  <h3>{selected.planName}</h3>
                  <p className="muted small">You are currently viewing this investment.</p>
                </div>
                <span className={`status ${selected.status}`}>{selected.status}</span>
              </div>

              <div className="investment-details-grid">
                <p>
                  <Wallet size={14} /> Invested Amount: <strong>${Number(selected.amount).toFixed(2)}</strong>
                </p>
                <p>
                  <BadgeDollarSign size={14} /> Current Earned: <strong>${Number(selected.accruedEarning).toFixed(4)}</strong>
                </p>
                <p>
                  <BadgeDollarSign size={14} /> Withdrawn Earnings: <strong>${Number(selected.claimedEarning).toFixed(4)}</strong>
                </p>
                <p>
                  <BadgeDollarSign size={14} /> Daily Profits Credited: <strong>${Number(selected.accruedEarning).toFixed(4)}</strong>
                </p>
                <p>
                  <CalendarClock size={14} /> Started At: <strong>{selected.startedAt ? String(selected.startedAt).slice(0, 10) : '-'}</strong>
                </p>
                <p>
                  <CalendarClock size={14} /> Maturity Date: <strong>{selected.maturityDate || '-'}</strong>
                </p>
              </div>

              <div className="investment-progress-block">
                <div className="row space-between">
                  <span className="muted small">Completion Progress</span>
                  <strong>{selectedProgress.toFixed(2)}%</strong>
                </div>
                <div className="progress-shell">
                  <div className="progress-fill" style={{ width: `${selectedProgress}%` }} />
                </div>
              </div>

              <div className="investment-help-box">
                <CheckCircle2 size={16} />
                <p>
                  Daily profits are credited to your wallet automatically, and you can withdraw those profit funds anytime from wallet.
                </p>
              </div>

              <div className="plan-actions">
                <button
                  className="mini-btn"
                  type="button"
                  disabled={!selected.canWithdrawEarning}
                  onClick={() => handleCreditProfit(selected)}
                >
                  Claim Daily Profit to Wallet
                </button>
              </div>
              <p className="muted small">
                Principal stays invested for the full plan term and is not refunded to wallet. Daily profits credit automatically.
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="glass-card investment-empty">
          <h3>No investments yet</h3>
          <p className="muted">Pick a plan to start earning and this page will show full progress and actions.</p>
          <Link to="/investment-plans" className="btn btn-primary">
            Browse Investment Plans <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </section>
  )
}

export default InvestmentsPage
