import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCheck,
  Copy,
  CreditCard,
  ExternalLink,
  Info,
  QrCode,
  ShieldCheck,
  Smartphone,
  Upload,
  Wallet,
} from 'lucide-react'
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
  if (path.includes('/images/')) {
    const fileName = path.split('/').filter(Boolean).pop()
    const base = import.meta.env.BASE_URL || '/'
    return `${base}images/${fileName}`
  }
  if (/^https?:\/\//i.test(path)) return path
  const base = API_BASE.replace(/\/api\/?$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function DepositPage() {
  const navigate = useNavigate()
  const { deposit, user, paymentAccounts } = useAppContext()
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const quickAmounts = [5, 25, 50, 100, 500, 1000]
  const [proofFile, setProofFile] = useState(null)
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [payMode, setPayMode] = useState('qr') // 'qr' or 'till'
  const [copiedKey, setCopiedKey] = useState('')

  const selectedAccount = paymentAccounts.find((item) => String(item.id) === String(selectedAccountId)) || paymentAccounts[0]
  const method = selectedAccount?.method || 'bank_transfer'
  const usdAmount = Number(amount || 0)
  const pkrAmount = Number((usdAmount * 300).toFixed(2))

  const isDigitOrTill =
    method === 'digit_plus' ||
    selectedAccount?.accountNumber === '346584733' ||
    selectedAccount?.phone === '346584733' ||
    selectedAccount?.displayName?.toLowerCase().includes('digit') ||
    selectedAccount?.displayName?.toLowerCase().includes('scan') ||
    selectedAccount?.displayName?.toLowerCase().includes('till')

  const methodLabel = {
    bank_transfer: 'Bank Transfer',
    easypaisa: 'Easypaisa',
    jazzcash: 'JazzCash',
    nayapay: 'NayaPay',
    sadapay: 'SadaPay',
    digit_plus: 'Digitt+ / Raast',
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

  const handleCopy = (text, key) => {
    if (!text) return
    navigator.clipboard.writeText(String(text).trim())
    setCopiedKey(key)
    toast.success(`Copied: ${key}`)
    setTimeout(() => setCopiedKey(''), 2500)
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
    if (!proofFile) {
      toast.error('Please attach payment screenshot before submitting')
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
    if (response.ok) {
      toast.success(response.message)
      setAmount('')
      setProofFile(null)
      const inputEl = document.getElementById('deposit-proof-input')
      if (inputEl) inputEl.value = ''
    } else {
      toast.error(response.message || 'Deposit submission failed.')
      if (response.status === 401) {
        toast.info('Redirecting to login...')
        setTimeout(() => navigate('/login'), 1200)
      }
    }
  }

  const tillId = selectedAccount?.accountNumber === '346584733' || isDigitOrTill ? (selectedAccount?.accountNumber || '346584733') : selectedAccount?.accountNumber
  const merchantTitle = selectedAccount?.accountTitle || (isDigitOrTill ? 'MashAllah Bhatti Mobilee' : '-')

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
        <h3>Select Payment Method / Account</h3>
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
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="deposit-pkr-estimate">
            <span>Estimated PKR (1 USD ≈ 300 PKR):</span>
            <strong>Rs {pkrAmount > 0 ? pkrAmount.toLocaleString() : '0.00'}</strong>
          </div>

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

                {isDigitOrTill ? (
                  /* Digitt+ / Raast Dual Mode (Scan & Pay OR Till ID) */
                  <div className="deposit-scan-pay-wrapper">
                    <div className="deposit-mode-switcher">
                      <button
                        type="button"
                        className={`deposit-mode-btn ${payMode === 'qr' ? 'active' : ''}`}
                        onClick={() => setPayMode('qr')}
                      >
                        <QrCode size={16} /> Scan & Pay (QR Code)
                      </button>
                      <button
                        type="button"
                        className={`deposit-mode-btn ${payMode === 'till' ? 'active' : ''}`}
                        onClick={() => setPayMode('till')}
                      >
                        <Smartphone size={16} /> Pay via Till ID
                      </button>
                    </div>

                    {payMode === 'qr' ? (
                      /* QR Code Scan & Pay Tab */
                      <div className="deposit-tab-content">
                        <div className="deposit-qr-card">
                          <div className="deposit-qr-media-box">
                            <img
                              src={toAssetUrl(selectedAccount.logoPath) || '/images/digitt_plus_scan_pay.png'}
                              alt="Digitt+ Raast QR Code"
                              className="deposit-qr-image-display"
                            />
                            <div className="deposit-qr-badge">
                              <QrCode size={13} /> Digitt+ / Raast Scan & Pay
                            </div>
                          </div>

                          <div className="deposit-account-meta compact">
                            <div className="account-meta-row copyable">
                              <div>
                                <span className="label">Merchant / Account Title</span>
                                <strong>{merchantTitle}</strong>
                              </div>
                              <button
                                type="button"
                                className="copy-action-btn"
                                onClick={() => handleCopy(merchantTitle, 'Merchant Name')}
                                title="Copy Merchant Name"
                              >
                                {copiedKey === 'Merchant Name' ? <CheckCheck size={14} className="copied" /> : <Copy size={14} />}
                                <span>{copiedKey === 'Merchant Name' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>

                            <div className="account-meta-row copyable">
                              <div>
                                <span className="label">Till ID (If asked)</span>
                                <strong>{tillId}</strong>
                              </div>
                              <button
                                type="button"
                                className="copy-action-btn"
                                onClick={() => handleCopy(tillId, 'Till ID')}
                                title="Copy Till ID"
                              >
                                {copiedKey === 'Till ID' ? <CheckCheck size={14} className="copied" /> : <Copy size={14} />}
                                <span>{copiedKey === 'Till ID' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Scanning Guidelines */}
                        <div className="deposit-guide-box">
                          <h4>
                            <QrCode size={16} /> Scan & Pay Guidelines:
                          </h4>
                          <ol>
                            <li>Open your <strong>Digitt+</strong>, <strong>Raast</strong>, <strong>Easypaisa</strong>, <strong>JazzCash</strong>, or Mobile Banking app.</li>
                            <li>Tap <strong>Scan QR</strong> or <strong>Scan & Pay</strong>.</li>
                            <li>Point your camera at the QR code above (or take a screenshot to upload from gallery).</li>
                            <li>Verify Merchant Name: <strong>MashAllah Bhatti Mobilee</strong>.</li>
                            <li>Enter the exact amount <strong>Rs {pkrAmount > 0 ? pkrAmount.toFixed(2) : '0.00'}</strong> (${usdAmount || 0}) and confirm.</li>
                            <li><strong>📸 Crucial: Take a screenshot of the payment receipt screen!</strong></li>
                          </ol>
                        </div>
                      </div>
                    ) : (
                      /* Till ID Tab */
                      <div className="deposit-tab-content">
                        <div className="deposit-till-highlight-card">
                          <span className="till-top-badge">
                            <Smartphone size={14} /> Digitt+ / Raast Merchant Till
                          </span>
                          <div className="till-id-large-row">
                            <span className="till-label">Till ID:</span>
                            <span className="till-id-number">{tillId}</span>
                            <button
                              type="button"
                              className="copy-till-btn"
                              onClick={() => handleCopy(tillId, 'Till ID')}
                            >
                              {copiedKey === 'Till ID' ? <CheckCheck size={16} /> : <Copy size={16} />}
                              <span>{copiedKey === 'Till ID' ? 'Copied!' : 'Copy Till ID'}</span>
                            </button>
                          </div>

                          <div className="account-meta-row copyable mt-2">
                            <div>
                              <span className="label">Merchant / Title</span>
                              <strong>{merchantTitle}</strong>
                            </div>
                            <button
                              type="button"
                              className="copy-action-btn"
                              onClick={() => handleCopy(merchantTitle, 'Merchant Title')}
                            >
                              {copiedKey === 'Merchant Title' ? <CheckCheck size={14} className="copied" /> : <Copy size={14} />}
                              <span>{copiedKey === 'Merchant Title' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Step-by-Step Till ID Guidelines */}
                        <div className="deposit-guide-box">
                          <h4>
                            <Smartphone size={16} /> Till ID Payment Guidelines:
                          </h4>
                          <ol>
                            <li>Open your <strong>Digitt+</strong> app or any banking app that supports Raast (Meezan, HBL, Bank Alfalah, etc.).</li>
                            <li>Go to <strong>Raast</strong> / <strong>Merchant Payment</strong> and choose <strong>Pay to Till ID</strong>.</li>
                            <li>Enter Till ID: <strong>{tillId}</strong>.</li>
                            <li>Verify the recipient name shows <strong>MashAllah Bhatti Mobilee</strong>.</li>
                            <li>Enter amount <strong>Rs {pkrAmount > 0 ? pkrAmount.toFixed(2) : '0.00'}</strong> (${usdAmount || 0}) and authorize transfer.</li>
                            <li><strong>📸 Crucial: Take a screenshot of the successful transaction screen!</strong></li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Bank / Wallet Account Details */
                  <div className="deposit-account-meta">
                    <div className="account-meta-row copyable">
                      <div>
                        <span className="label">{method === 'crypto' ? 'Wallet / Network' : 'Account Title'}</span>
                        <strong>{selectedAccount.accountTitle || '-'}</strong>
                      </div>
                      {selectedAccount.accountTitle ? (
                        <button
                          type="button"
                          className="copy-action-btn"
                          onClick={() => handleCopy(selectedAccount.accountTitle, 'Account Title')}
                        >
                          {copiedKey === 'Account Title' ? <CheckCheck size={14} className="copied" /> : <Copy size={14} />}
                          <span>{copiedKey === 'Account Title' ? 'Copied' : 'Copy'}</span>
                        </button>
                      ) : null}
                    </div>

                    <div className="account-meta-row copyable">
                      <div>
                        <span className="label">{method === 'crypto' ? 'Wallet Address' : 'Account Number / Phone'}</span>
                        <strong>{selectedAccount.accountNumber || selectedAccount.phone || '-'}</strong>
                      </div>
                      {selectedAccount.accountNumber || selectedAccount.phone ? (
                        <button
                          type="button"
                          className="copy-action-btn"
                          onClick={() => handleCopy(selectedAccount.accountNumber || selectedAccount.phone, 'Account Number')}
                        >
                          {copiedKey === 'Account Number' ? <CheckCheck size={14} className="copied" /> : <Copy size={14} />}
                          <span>{copiedKey === 'Account Number' ? 'Copied' : 'Copy'}</span>
                        </button>
                      ) : null}
                    </div>

                    {selectedAccount.iban ? (
                      <div className="account-meta-row copyable">
                        <div>
                          <span className="label">IBAN</span>
                          <strong>{selectedAccount.iban}</strong>
                        </div>
                        <button
                          type="button"
                          className="copy-action-btn"
                          onClick={() => handleCopy(selectedAccount.iban, 'IBAN')}
                        >
                          {copiedKey === 'IBAN' ? <CheckCheck size={14} className="copied" /> : <Copy size={14} />}
                          <span>{copiedKey === 'IBAN' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="bank-note">
                  <Info size={14} /> {selectedAccount.instructions || 'Send payment to this account, take a screenshot of the receipt, and upload it below.'}
                </div>
              </article>
            </div>
          ) : (
            <div className="deposit-empty-account-box">
              <Info size={16} />
              <p>No active payment account is available right now. Please contact support.</p>
            </div>
          )}

          {/* Mandatory Screenshot Proof Alert Box */}
          <div className="deposit-screenshot-callout">
            <Camera size={22} className="callout-icon" />
            <div>
              <strong>Upload Screenshot of Payment Receipt (Mandatory)</strong>
              <p>
                After completing your payment via Scan & Pay or Till ID, take a clear screenshot of the receipt showing the Transaction ID (TRX/RRN), Date, and Amount, then attach it below.
              </p>
            </div>
          </div>

          <div className="deposit-proof-box">
            <label htmlFor="deposit-proof-input" className="deposit-proof-label">
              <Upload size={16} />
              <span>{proofFile ? 'Change Attached Screenshot' : 'Click to Upload Payment Screenshot (Required)'}</span>
            </label>
            <input
              id="deposit-proof-input"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            />
            {proofFile ? (
              <div className="selected-proof-preview">
                <CheckCheck size={15} className="proof-check" />
                <span className="proof-name">Selected: {proofFile.name}</span>
              </div>
            ) : null}
          </div>
        </div>

        <button className="btn btn-primary deposit-submit-btn" type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Deposit with Proof'} <ArrowRight size={16} />
        </button>

        <div className="deposit-help-box">
          <Info size={16} />
          <div>
            <p>- Minimum deposit is $5 (equivalent in PKR).</p>
            <p>- Ensure you enter the exact amount in your banking app as shown above.</p>
            <p>- Do not submit duplicate requests for the same transfer.</p>
            <p>- Deposits are typically reviewed and approved within 5-30 minutes.</p>
            <p>- Need help? Contact our official WhatsApp channel anytime.</p>
          </div>
        </div>
      </form>
    </section>
  )
}

export default DepositPage
