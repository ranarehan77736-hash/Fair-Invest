import { useState } from 'react'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'
import { API_BASE } from '../lib/api.js'

const initialForm = {
  id: null,
  method: 'bank_transfer',
  displayName: '',
  accountTitle: '',
  accountNumber: '',
  instructions: '',
  logoPath: '',
  isActive: true,
}
const METHOD_OPTIONS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'nayapay', label: 'NayaPay' },
  { value: 'sadapay', label: 'SadaPay' },
  { value: 'digit_plus', label: 'Digit Plus' },
  { value: 'crypto', label: 'Crypto' },
]
const PAKISTANI_BANK_TEMPLATES = [
  { label: 'HBL', displayName: 'HBL - Habib Bank Limited', logoPath: '/bank-logos/hbl.png' },
  { label: 'UBL', displayName: 'UBL - United Bank Limited', logoPath: '/bank-logos/ubl.png' },
  { label: 'MCB', displayName: 'MCB Bank', logoPath: '/bank-logos/mcb.png' },
  { label: 'Allied Bank', displayName: 'Allied Bank Limited', logoPath: '/bank-logos/allied-bank.png' },
  { label: 'Bank Alfalah', displayName: 'Bank Alfalah', logoPath: '/bank-logos/bank-alfalah.jfif' },
  { label: 'Meezan', displayName: 'Meezan Bank', logoPath: '/bank-logos/meezan.png' },
  { label: 'Bank Al Habib', displayName: 'Bank Al Habib', logoPath: '/bank-logos/bank-al-habib.jfif' },
  { label: 'Faysal', displayName: 'Faysal Bank', logoPath: '/bank-logos/faysal-bank.jfif' },
  { label: 'Askari', displayName: 'Askari Bank', logoPath: '/bank-logos/askari-bank.jfif' },
  { label: 'BOP', displayName: 'Bank of Punjab', logoPath: '/bank-logos/bank-of-punjab.png' },
  { label: 'NBP', displayName: 'National Bank of Pakistan (NBP)', logoPath: '/bank-logos/nbp.jfif' },
  { label: 'Soneri', displayName: 'Soneri Bank', logoPath: '/bank-logos/soneri-bank.jfif' },
  { label: 'Summit', displayName: 'Summit Bank', logoPath: '/bank-logos/summit-bank.png' },
  { label: 'DIB Pakistan', displayName: 'Dubai Islamic Bank Pakistan', logoPath: '/bank-logos/dib-pakistan.jfif' },
  { label: 'Standard Chartered', displayName: 'Standard Chartered Pakistan', logoPath: '/bank-logos/standard-chartered.jfif' },
  { label: 'JS Bank', displayName: 'JS Bank', logoPath: '/bank-logos/js-bank.png' },
  { label: 'Silkbank', displayName: 'Silkbank', logoPath: '/bank-logos/silk-bank.png' },
]
const DIGITAL_METHOD_TEMPLATES = [
  {
    label: 'Easypaisa',
    method: 'easypaisa',
    displayName: 'Easypaisa Account',
    logoPath: '/bank-logos/easypaisa.png',
  },
  { label: 'JazzCash', method: 'jazzcash', displayName: 'JazzCash Account', logoPath: '/bank-logos/jazzcash.png' },
  { label: 'NayaPay', method: 'nayapay', displayName: 'NayaPay Account', logoPath: '/bank-logos/nayapay.png' },
  { label: 'SadaPay', method: 'sadapay', displayName: 'SadaPay Account', logoPath: '/bank-logos/sadapay.png' },
  { label: 'Digit Plus', method: 'digit_plus', displayName: 'Digit Plus Account', logoPath: '/bank-logos/digit-plus.png' },
  {
    label: 'USDT TRC20',
    method: 'crypto',
    displayName: 'USDT (TRC20) Wallet',
    logoPath: '/bank-logos/usdt-trc20.png',
  },
  {
    label: 'USDT BEP20',
    method: 'crypto',
    displayName: 'USDT (BEP20) Wallet',
    logoPath: '/bank-logos/usdt-bep20.jfif',
  },
  {
    label: 'Bitcoin',
    method: 'crypto',
    displayName: 'Bitcoin Wallet',
    logoPath: '/bank-logos/bitcoin.png',
  },
  {
    label: 'Ethereum',
    method: 'crypto',
    displayName: 'Ethereum Wallet',
    logoPath: '/bank-logos/ethereum.png',
  },
]

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

function PaymentAccountsPage() {
  const { paymentAccounts, createPaymentAccount, updatePaymentAccount, deletePaymentAccount } = useAdmin()
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('all')
  const [showInactive, setShowInactive] = useState(false)

  const onEdit = (item) => {
    setForm({
      id: item.id,
      method: item.method,
      displayName: item.displayName || '',
      accountTitle: item.accountTitle || '',
      accountNumber: item.accountNumber || '',
      instructions: item.instructions || '',
      logoPath: item.logoPath || '',
      isActive: !!item.isActive,
    })
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = {
        method: form.method,
        displayName: form.displayName,
        accountTitle: form.accountTitle || undefined,
        accountNumber: form.accountNumber || undefined,
        instructions: form.instructions || undefined,
        logoPath: form.logoPath || undefined,
        isActive: form.isActive,
      }
      if (form.id) {
        await updatePaymentAccount(form.id, payload)
        toast.success('Payment account updated')
      } else {
        await createPaymentAccount(payload)
        toast.success('Payment account added')
      }
      setForm(initialForm)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this payment account?')) return
    try {
      const message = await deletePaymentAccount(id)
      toast.success(message)
      if (form.id === id) setForm(initialForm)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const applyBankTemplate = (bankTemplate) => {
    setForm((prev) => ({
      ...prev,
      method: 'bank_transfer',
      displayName: bankTemplate.displayName,
      logoPath: bankTemplate.logoPath || prev.logoPath,
      instructions:
        prev.instructions ||
        'Transfer to this bank account, then upload payment proof screenshot from user deposit section for verification.',
    }))
  }

  const applyDigitalTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      method: template.method,
      displayName: template.displayName,
      logoPath: template.logoPath || prev.logoPath,
      instructions:
        prev.instructions ||
        'Send payment to this account and upload screenshot for quick approval. Ensure account title/number is correct.',
    }))
  }

  const filteredAccounts = paymentAccounts.filter((item) => {
    const methodPass = selectedMethodFilter === 'all' ? true : item.method === selectedMethodFilter
    const activePass = showInactive ? true : !!item.isActive
    return methodPass && activePass
  })
  const logoSuggestions =
    form.method === 'bank_transfer'
      ? PAKISTANI_BANK_TEMPLATES
      : DIGITAL_METHOD_TEMPLATES.filter((item) => item.method === form.method)

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Payment Accounts</h2>
        <p>Add and manage all payment gateways (Bank, Easypaisa, JazzCash, NayaPay, SadaPay, Digit Plus, Crypto).</p>
      </header>

      <form className="table-card plan-form" onSubmit={onSubmit}>
        <h3>{form.id ? `Edit Account #${form.id}` : 'Add Payment Account'}</h3>
        <div className="payment-template-block">
          <h4 className="payment-template-title">Official Bank & Wallet Logo Presets</h4>
          <p className="muted payment-template-subtitle">Choose a provider and apply a ready-to-use styled block.</p>
          <div className="payment-template-grid">
            <select
              className="template-select"
              defaultValue=""
              onChange={(e) => {
                const picked = PAKISTANI_BANK_TEMPLATES.find((item) => item.displayName === e.target.value)
                if (picked) applyBankTemplate(picked)
              }}
            >
              <option value="" disabled>
                Select Pakistani bank template
              </option>
              {PAKISTANI_BANK_TEMPLATES.map((bank) => (
                <option key={bank.displayName} value={bank.displayName}>
                  {bank.displayName}
                </option>
              ))}
            </select>
            <select
              className="template-select"
              defaultValue=""
              onChange={(e) => {
                const picked = DIGITAL_METHOD_TEMPLATES.find((item) => item.label === e.target.value)
                if (picked) applyDigitalTemplate(picked)
              }}
            >
              <option value="" disabled>
                Select wallet/crypto template
              </option>
              {DIGITAL_METHOD_TEMPLATES.map((item) => (
                <option key={item.label} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="logo-library-grid">
            {logoSuggestions.map((item) => (
              <button
                key={`${item.label}-${item.displayName}`}
                type="button"
                className="logo-library-item"
                onClick={() => {
                  if (form.method === 'bank_transfer') applyBankTemplate(item)
                  else applyDigitalTemplate(item)
                }}
                title={`Use ${item.label} logo`}
              >
                <img className="logo-library-thumb" src={toAssetUrl(item.logoPath)} alt={item.label} loading="lazy" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <p className="muted tiny">
            Quick logo library added. For exact brand compliance, you can still upload the original official logo file from each bank/provider.
          </p>
        </div>
        <div className="plan-grid">
          <select
            value={form.method}
            onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
          >
            {METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Display Name"
            value={form.displayName}
            onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
            required
          />
          <input
            placeholder={form.method === 'crypto' ? 'Wallet Label / Network (optional)' : 'Account Title'}
            value={form.accountTitle}
            onChange={(e) => setForm((prev) => ({ ...prev, accountTitle: e.target.value }))}
          />
          <input
            placeholder={form.method === 'crypto' ? 'Wallet Address' : 'Account Number'}
            value={form.accountNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
          />
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active account
          </label>
        </div>
        {form.logoPath ? (
          <p className="muted small selected-logo-path">
            Logo path: <code>{form.logoPath}</code>
          </p>
        ) : null}
        <textarea
          placeholder="Instructions shown to user"
          rows={3}
          value={form.instructions}
          onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))}
        />
        <div className="plan-actions">
          <button className="primary-btn" disabled={saving}>
            {saving ? 'Saving...' : form.id ? 'Update Account' : 'Add Account'}
          </button>
          <button type="button" className="mini-btn" onClick={() => setForm(initialForm)}>
            Reset
          </button>
        </div>
      </form>

      <div className="table-card">
        <div className="panel-tools">
          <select value={selectedMethodFilter} onChange={(e) => setSelectedMethodFilter(e.target.value)}>
            <option value="all">All methods</option>
            {METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="checkbox-row payment-show-inactive">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            Show inactive
          </label>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Method</th>
              <th>Name</th>
              <th>Account</th>
              <th>Logo</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.method}</td>
                <td>{item.displayName}</td>
                <td>{item.accountNumber || '-'}</td>
                <td>
                  {item.logoPath ? (
                    <img className="account-logo-preview" src={toAssetUrl(item.logoPath)} alt={item.displayName} width={48} height={48} />
                  ) : (
                    '-'
                  )}
                </td>
                <td>{item.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button className="mini-btn" onClick={() => onEdit(item)}>
                    Edit
                  </button>
                  <button className="mini-btn danger-inline" onClick={() => onDelete(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default PaymentAccountsPage
