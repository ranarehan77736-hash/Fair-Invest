import { useState } from 'react'
import { AlertTriangle, ArrowRight, Building2, Check, Clock3, Lock, Smartphone, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { API_BASE } from '../lib/api.js'

const toAssetUrl = (path) => {
  if (!path) return ''
  if (path.includes('/bank-logos/')) {
    const fileName = path.split('/').filter(Boolean).pop()
    const base = import.meta.env.BASE_URL || '/'
    return `${base}bank-logos/${fileName}`
  }
  if (/^https?:\/\//i.test(path)) return path
  const base = API_BASE.replace(/\/api\/?$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function WithdrawPage() {
  const { withdraw, user, withdrawals, withdrawalCooldown, investments, claimInvestment } = useAppContext()
  const [amount, setAmount] = useState('')
  const [selectedPayoutOptionId, setSelectedPayoutOptionId] = useState('bank-alfalah')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountTitle, setAccountTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const payoutOptions = [
    { id: 'hbl', displayName: 'HBL - Habib Bank Limited', method: 'bank_transfer', logoPath: '/bank-logos/hbl.png' },
    { id: 'ubl', displayName: 'UBL - United Bank Limited', method: 'bank_transfer', logoPath: '/bank-logos/ubl.png' },
    { id: 'mcb', displayName: 'MCB Bank', method: 'bank_transfer', logoPath: '/bank-logos/mcb.png' },
    { id: 'allied-bank', displayName: 'Allied Bank Limited', method: 'bank_transfer', logoPath: '/bank-logos/allied-bank.png' },
    { id: 'bank-alfalah', displayName: 'Bank Alfalah', method: 'bank_transfer', logoPath: '/bank-logos/bank-alfalah.jfif' },
    { id: 'meezan', displayName: 'Meezan Bank', method: 'bank_transfer', logoPath: '/bank-logos/meezan.png' },
    { id: 'bank-al-habib', displayName: 'Bank Al Habib', method: 'bank_transfer', logoPath: '/bank-logos/bank-al-habib.jfif' },
    { id: 'faysal', displayName: 'Faysal Bank', method: 'bank_transfer', logoPath: '/bank-logos/faysal-bank.jfif' },
    { id: 'askari', displayName: 'Askari Bank', method: 'bank_transfer', logoPath: '/bank-logos/askari-bank.jfif' },
    { id: 'bop', displayName: 'Bank of Punjab', method: 'bank_transfer', logoPath: '/bank-logos/bank-of-punjab.png' },
    { id: 'nbp', displayName: 'National Bank of Pakistan (NBP)', method: 'bank_transfer', logoPath: '/bank-logos/nbp.jfif' },
    { id: 'soneri', displayName: 'Soneri Bank', method: 'bank_transfer', logoPath: '/bank-logos/soneri-bank.jfif' },
    { id: 'summit', displayName: 'Summit Bank', method: 'bank_transfer', logoPath: '/bank-logos/summit-bank.png' },
    { id: 'dib', displayName: 'Dubai Islamic Bank Pakistan', method: 'bank_transfer', logoPath: '/bank-logos/dib-pakistan.jfif' },
    { id: 'standard-chartered', displayName: 'Standard Chartered Pakistan', method: 'bank_transfer', logoPath: '/bank-logos/standard-chartered.jfif' },
    { id: 'js-bank', displayName: 'JS Bank', method: 'bank_transfer', logoPath: '/bank-logos/js-bank.png' },
    { id: 'silkbank', displayName: 'Silkbank', method: 'bank_transfer', logoPath: '/bank-logos/silk-bank.png' },
    { id: 'easypaisa', displayName: 'Easypaisa', method: 'easypaisa', logoPath: '/bank-logos/easypaisa.png' },
    { id: 'jazzcash', displayName: 'JazzCash', method: 'jazzcash', logoPath: '/bank-logos/jazzcash.png' },
    { id: 'nayapay', displayName: 'NayaPay', method: 'nayapay', logoPath: '/bank-logos/nayapay.png' },
    { id: 'sadapay', displayName: 'SadaPay', method: 'sadapay', logoPath: '/bank-logos/sadapay.png' },
    { id: 'digit-plus', displayName: 'Digit Plus', method: 'digit_plus', logoPath: '/bank-logos/digit-plus.png' },
    { id: 'usdt-trc20', displayName: 'USDT (TRC20)', method: 'crypto', logoPath: '/bank-logos/usdt-trc20.png' },
    { id: 'usdt-bep20', displayName: 'USDT (BEP20)', method: 'crypto', logoPath: '/bank-logos/usdt-bep20.jfif' },
    { id: 'bitcoin', displayName: 'Bitcoin', method: 'crypto', logoPath: '/bank-logos/bitcoin.png' },
    { id: 'ethereum', displayName: 'Ethereum', method: 'crypto', logoPath: '/bank-logos/ethereum.png' },
  ]
  const selectedPayoutAccount =
    payoutOptions.find((item) => item.id === selectedPayoutOptionId) || payoutOptions[0]
  const method = selectedPayoutAccount?.method || 'bank_transfer'
  const methodLabel = {
    bank_transfer: 'Bank Transfer',
    easypaisa: 'Easypaisa',
    jazzcash: 'JazzCash',
    nayapay: 'NayaPay',
    sadapay: 'SadaPay',
    digit_plus: 'Digit Plus',
    crypto: 'Crypto',
  }
  const iconForMethod = {
    bank_transfer: Building2,
    easypaisa: Smartphone,
    jazzcash: Smartphone,
    nayapay: Smartphone,
    sadapay: Smartphone,
    digit_plus: Smartphone,
    crypto: Wallet,
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!withdrawalCooldown.canWithdraw) {
      toast.error('You can request your next withdrawal 24 hours after your last request.')
      return
    }
    if (!selectedPayoutAccount?.id) {
      toast.error('Please select a payout account')
      return
    }
    const accountDetails = {
      accountNumber,
      accountTitle: method === 'crypto' ? undefined : accountTitle,
      walletAddress: method === 'crypto' ? accountNumber : undefined,
      selectedPayoutAccountId: selectedPayoutOptionId,
      selectedPayoutAccountName: selectedPayoutAccount.displayName,
    }
    setSubmitting(true)
    const response = await withdraw({ amount, method, accountDetails })
    setSubmitting(false)
    if (response.ok) toast.success(response.message)
    else toast.error(response.message)
    if (response.ok) setAmount('')
  }
  const numericAmount = Number(amount) || 0
  const fee = numericAmount * 0.1
  const net = Math.max(0, numericAmount - fee)
  const lockedDepositBalance = Number(user.lockedBalance || 0)
  const withdrawableBalance = Math.max(0, Number(user.balance || 0) - lockedDepositBalance)
  const recentWithdrawals = withdrawals
  const totalPotentialProfit = investments.reduce((acc, item) => acc + Number(item.profit || 0), 0)
  const onWithdrawalCooldown = !withdrawalCooldown.canWithdraw
  const cooldownEndsAt = withdrawalCooldown.nextAllowedAt
    ? new Date(withdrawalCooldown.nextAllowedAt).toLocaleString()
    : ''
  const cooldownHoursLeft = Math.ceil(Number(withdrawalCooldown.hoursRemaining || 0))

  const handleClaim = async (investment) => {
    const response = await claimInvestment(investment.rawId)
    if (response.ok) toast.success(response.message)
    else toast.error(response.message)
  }

  return (
    <section className="page-grid withdraw-page">
      <div className="glass-card withdraw-hero">
        <span className="pill-badge cyan">
          <Wallet size={14} /> Withdraw Funds
        </span>
        <h2 className="page-title">Request Withdrawal</h2>
        <p className="muted">Withdraw your earnings securely to your preferred account.</p>
      </div>

      <div className="balance-banner withdraw-balance-banner">
        <div>
          <p className="muted">Available for Withdrawal</p>
          <h3>${withdrawableBalance.toFixed(2)}</h3>
        </div>
        <span className="deposit-balance-icon">
          <Wallet size={24} />
        </span>
      </div>
      <div className="locked-funds-note">
        <span className="pill-badge violet">
          <Lock size={13} /> Locked Deposit Balance
        </span>
        <strong>${lockedDepositBalance.toFixed(2)}</strong>
        <p className="muted small">Deposited funds are frozen for investment use and cannot be withdrawn directly.</p>
      </div>

      {onWithdrawalCooldown ? (
        <div className="warning-box withdraw-warning-box">
          <Clock3 size={16} />
          <div>
            <strong>Withdrawal cooldown active</strong>
            <p>
              You can request your next withdrawal 24 hours after your last request
              {withdrawalCooldown.lastWithdrawalStatus
                ? ` (${withdrawalCooldown.lastWithdrawalStatus}).`
                : '.'}
            </p>
            <p>
              Try again in about {cooldownHoursLeft} hour(s)
              {cooldownEndsAt ? ` (${cooldownEndsAt}).` : '.'}
            </p>
          </div>
        </div>
      ) : null}

      <form className="glass-card form-card withdraw-form-card" onSubmit={handleSubmit}>
        <h3>Withdrawal Details</h3>
        <label>Withdrawal Amount (USD)</label>
        <div className="amount-wrap cyan">
          <span>$</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <p className="muted small">Minimum withdrawal: $1 - Maximum: Unlimited (subject to wallet balance)</p>

        <label>Select Payout Account</label>
        <select
          className="withdraw-payout-select"
          value={selectedPayoutOptionId}
          onChange={(e) => setSelectedPayoutOptionId(e.target.value)}
          required
        >
          {payoutOptions.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName} ({methodLabel[account.method] || account.method})
            </option>
          ))}
        </select>

        {selectedPayoutAccount ? (
          <div className="deposit-account-card active withdraw-selected-account-card">
            <div className="deposit-account-head">
              {selectedPayoutAccount.logoPath ? (
                <img className="deposit-account-logo" src={toAssetUrl(selectedPayoutAccount.logoPath)} alt={selectedPayoutAccount.displayName} />
              ) : (
                <span className="deposit-account-logo placeholder">
                  {(() => {
                    const Icon = iconForMethod[selectedPayoutAccount.method] || Wallet
                    return <Icon size={18} />
                  })()}
                </span>
              )}
              <div>
                <strong>{selectedPayoutAccount.displayName}</strong>
                <p>{methodLabel[selectedPayoutAccount.method] || selectedPayoutAccount.method}</p>
              </div>
            </div>
            <div className="bank-note">
              <Check size={14} /> Fee: 10% | You selected {selectedPayoutAccount.displayName}
            </div>
          </div>
        ) : (
          <div className="deposit-empty-account-box">
            <AlertTriangle size={16} />
            <p>No payout account is configured by admin right now.</p>
          </div>
        )}

        <div className="withdraw-accounts-grid">
          <div>
            <label>{method === 'crypto' ? 'Wallet Address' : 'Account Number'}</label>
            <input
              type="text"
              placeholder={method === 'crypto' ? 'Enter your wallet address' : 'Enter your account number'}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          {method !== 'crypto' ? (
            <div>
              <label>Account Title</label>
              <input
                type="text"
                placeholder="Enter account title"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                required
              />
            </div>
          ) : null}
        </div>

        {numericAmount > 0 ? (
          <div className="summary-card withdraw-summary-card">
            <p>Withdrawal amount: ${numericAmount.toFixed(2)}</p>
            <p>Processing fee: ${fee.toFixed(2)}</p>
            <h4>Net amount: ${net.toFixed(2)}</h4>
          </div>
        ) : null}

        <button
          className="btn btn-primary"
          type="submit"
          disabled={submitting || onWithdrawalCooldown}
        >
          {submitting ? 'Submitting...' : onWithdrawalCooldown ? 'Withdrawal Cooldown Active' : 'Request Withdrawal'}{' '}
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="glass-card withdraw-history-card">
        <h3>Investment Status</h3>
        <p className="muted">Investment principal stays locked while active. Daily profits are credited every 24 hours.</p>
        <p className="small">Total potential profit: ${totalPotentialProfit.toFixed(2)}</p>
        <div className="recent-list">
          {investments.slice(0, 8).map((item) => (
            <article key={item.id} className="recent-item">
              <div className="recent-left">
                <span className="recent-avatar">INV</span>
                <div>
                  <strong>{item.planName}</strong>
                  <p className="muted small">
                    Invested: ${Number(item.amount).toFixed(2)} | Earned: ${Number(item.accruedEarning || item.profit).toFixed(4)}
                  </p>
                  <p className="muted small">Maturity: {item.maturityDate || '-'}</p>
                </div>
              </div>
              <div className="recent-right">
                <strong>${Number(item.expectedReturn || 0).toFixed(2)}</strong>
                {item.canClaim ? (
                  <button className="mini-btn" onClick={() => handleClaim(item)}>
                    Claim Principal
                  </button>
                ) : (
                  <span className={`status ${item.status}`}>{item.status}</span>
                )}
              </div>
            </article>
          ))}
          {!investments.length ? <p className="muted small">No investments yet.</p> : null}
        </div>
      </div>

      <div className="warning-box withdraw-warning-box">
        <AlertTriangle size={16} />
        <div>
          <strong>Important Information:</strong>
          <p>- Withdrawals are processed Monday to Friday, 9 AM to 5 PM PST.</p>
          <p>- Ensure your account details are correct to avoid delays.</p>
          <p>- Withdrawal fee is 10% on all selected methods.</p>
          <p>- You can request one withdrawal every 24 hours (approved or rejected requests count).</p>
          <p>- Contact support if you don&apos;t receive funds within the specific time.</p>
          <p>- Note: minimum withdrawal amount is $1.</p>
        </div>
      </div>

      <div className="glass-card withdraw-history-card">
        <h3>
          <Clock3 size={16} /> Recent Withdrawals
        </h3>
        <div className="recent-list">
          {recentWithdrawals.map((item) => (
            <article key={item.id} className="recent-item">
              <div className="recent-left">
                <span className="recent-avatar">{String(item.method || 'WD').slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{item.method}</strong>
                  <p className="muted small">{item.date}</p>
                  {item.status === 'completed' ? (
                    <p className="muted small">
                      Paid ${Number(item.approvedAmount || 0).toFixed(2)} | Refund ${Number(item.refundAmount || 0).toFixed(2)}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="recent-right">
                <strong>{item.amount}</strong>
                <span
                  className={
                    item.status === 'completed'
                      ? 'status active'
                      : item.status === 'processing'
                        ? 'status processing'
                        : 'status pending'
                  }
                >
                  {String(item.status).charAt(0).toUpperCase() + String(item.status).slice(1)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WithdrawPage
