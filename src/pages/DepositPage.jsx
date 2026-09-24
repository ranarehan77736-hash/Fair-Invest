import { useEffect, useState } from 'react'
import { ArrowRight, Building2, Check, Info, Smartphone, Upload, Wallet } from 'lucide-react'
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

function DepositPage() {
  const { deposit, user, paymentAccounts } = useAppContext()
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const quickAmounts = [5, 25, 50, 100, 500, 1000]
  const [proofFile, setProofFile] = useState(null)
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const selectedAccount = paymentAccounts.find((item) => String(item.id) === String(selectedAccountId)) || paymentAccounts[0]
  const method = selectedAccount?.method || 'bank_transfer'
  const usdAmount = Number(amount || 0)
  const pkrAmount = Number((usdAmount * 300).toFixed(2))
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

  useEffect(() => {
    if (!paymentAccounts.length) {
      setSelectedAccountId('')
      return
    }
    const isSelectedStillValid = paymentAccounts.some((item) => String(item.id) === String(selectedAccountId))
    if (!isSelectedStillValid) setSelectedAccountId(String(paymentAccounts[0].id))
  }, [paymentAccounts, selectedAccountId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedAccount?.id) {
      toast.error('Please select a payment account')
      return
    }
    setSubmitting(true)
    const response = await deposit({
      amount,
      method,
      paymentAccountId: selectedAccount.id,
      proofFile,
    })
    setSubmitting(false)
    if (response.ok) toast.success(response.message)
    else toast.error(response.message)
    if (response.ok) {
      setAmount('')
      setProofFile(null)
    }
  }

  return (
    <section className="page-grid deposit-page">
      <div className="glass-card deposit-hero">
        <span className="pill-badge">
          <Wallet size={14} /> Add Funds
        </span>
        <h2 className="page-title">Make a Deposit</h2>
        <p className="muted">Add funds to your account and start investing today.</p>
      </div>

      <div className="balance-banner deposit-balance-banner">
        <div>
          <p className="muted">Available Balance</p>
          <h3>${user.balance.toFixed(2)}</h3>
        </div>
        <span className="deposit-balance-icon">
          <Wallet size={24} />
        </span>
      </div>

      <form className="glass-card form-card deposit-form-card" onSubmit={handleSubmit}>
        <h3>Select Payment Account</h3>
        <div className="method-grid deposit-method-grid">
          {paymentAccounts.map((account) => {
            const methodKey = account.method
            const Icon = iconForMethod[methodKey] || Wallet
            const isSelected = String(selectedAccount?.id) === String(account.id)
            return (
              <button
                key={account.id}
                type="button"
                className={`method-card deposit-method-card ${isSelected ? 'active emerald' : ''}`}
                onClick={() => setSelectedAccountId(String(account.id))}
              >
                <span className="deposit-method-icon">
                  {account.logoPath ? (
                    <img src={toAssetUrl(account.logoPath)} alt={account.displayName || methodLabel[methodKey] || methodKey} width={28} height={28} />
                  ) : (
                    <Icon size={20} />
                  )}
                </span>
                <strong>{account.displayName || methodLabel[methodKey] || methodKey}</strong>
                <span className="muted">{methodLabel[methodKey] || methodKey}</span>
                {isSelected ? (
                  <span className="deposit-method-check">
                    <Check size={13} />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="deposit-amount-block">
          <h3>Enter Deposit Amount</h3>
          <label>Amount (USD)</label>
          <div className="amount-wrap">
            <span>$</span>
            <input
              type="number"
              min="5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <p className="muted small">PKR estimate (1 USD = 300 PKR): Rs {pkrAmount.toFixed(2)}</p>

          <div className="quick-amounts">
            {quickAmounts.map((value) => (
              <button key={value} type="button" onClick={() => setAmount(String(value))}>
                ${value}
              </button>
            ))}
          </div>

          {selectedAccount ? (
            <div className="deposit-account-grid single">
              <article className="deposit-account-card active">
                <div className="deposit-account-head">
                  {selectedAccount.logoPath ? (
                    <img className="deposit-account-logo" src={toAssetUrl(selectedAccount.logoPath)} alt={selectedAccount.displayName} />
                  ) : (
                    <span className="deposit-account-logo placeholder">
                      {method === 'bank_transfer' ? <Building2 size={18} /> : <Smartphone size={18} />}
                    </span>
                  )}
                  <div>
                    <strong>{selectedAccount.displayName}</strong>
                    <p>{methodLabel[method] || method}</p>
                  </div>
                </div>
                <div className="deposit-account-meta">
                  <p className="account-meta-row">
                    <span className="label">{method === 'crypto' ? 'Wallet / Network' : 'Account Name'}</span>
                    <strong>{selectedAccount.accountTitle || '-'}</strong>
                  </p>
                  <p className="account-meta-row">
                    <span className="label">{method === 'crypto' ? 'Wallet Address' : 'Account Number'}</span>
                    <strong>{selectedAccount.accountNumber || selectedAccount.phone || '-'}</strong>
                  </p>
                  {selectedAccount.iban ? (
                    <p className="account-meta-row">
                      <span className="label">IBAN</span>
                      <strong>{selectedAccount.iban}</strong>
                    </p>
                  ) : null}
                </div>
                <div className="bank-note">
                  <Info size={14} /> {selectedAccount.instructions || 'Use this account and upload payment proof screenshot.'}
                </div>
              </article>
            </div>
          ) : (
            <div className="deposit-empty-account-box">
              <Info size={16} />
              <p>
                No active payment account is available right now. Please contact support.
              </p>
            </div>
          )}

          <div className="deposit-proof-box">
            <label htmlFor="deposit-proof-input">
              <Upload size={14} /> Attach payment screenshot (required)
            </label>
            <input
              id="deposit-proof-input"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            />
            {proofFile ? <p className="muted small">Selected file: {proofFile.name}</p> : null}
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Complete Deposit'} <ArrowRight size={16} />
        </button>

        <div className="deposit-help-box">
          <Info size={16} />
          <div>
            <p>- If the transfer time is up, please fill out the deposit form again.</p>
            <p>- Do not cancel the deposit after sending the money.</p>
            <p>- Minimum deposit is $5.</p>
            <p>- Deposits are usually processed within 5-30 minutes.</p>
            <p>- Contact support if you face any issue.</p>
          </div>
        </div>
      </form>
    </section>
  )
}

export default DepositPage
