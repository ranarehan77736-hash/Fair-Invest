import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'
import { API_BASE } from '../lib/api.js'

const emptyForm = {
  id: null,
  name: '',
  slug: '',
  minAmount: 100,
  maxAmount: '',
  durationDays: 365,
  dailyReturn: 3.5,
  payoutDailyReturn: 1,
  totalReturn: 60,
  features: '',
  imagePath: '',
  isActive: true,
}

const toAssetUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = API_BASE.replace(/\/api\/?$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function PlansPage() {
  const { plans, savePlan, deletePlan, uploadMedia } = useAdmin()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const rows = useMemo(
    () =>
      plans.map((plan) => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : [],
      })),
    [plans],
  )

  const onEdit = (plan) => {
    setForm({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      minAmount: Number(plan.minAmount),
      maxAmount: plan.maxAmount ?? '',
      durationDays: Number(plan.durationDays),
      dailyReturn: Number(plan.dailyReturn),
      payoutDailyReturn: Number(plan.payoutDailyReturn ?? plan.dailyReturn),
      totalReturn: Number(plan.totalReturn),
      features: (plan.features || []).join(', '),
      imagePath: plan.imagePath || '',
      isActive: !!plan.isActive,
    })
  }

  const onImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const path = await uploadMedia('plan', file)
      setForm((prev) => ({ ...prev, imagePath: path }))
      toast.success('Plan image uploaded')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await savePlan({
        id: form.id || undefined,
        name: form.name,
        slug: form.slug || undefined,
        minAmount: Number(form.minAmount),
        maxAmount: form.maxAmount === '' ? null : Number(form.maxAmount),
        durationDays: Number(form.durationDays),
        dailyReturn: Number(form.dailyReturn),
        payoutDailyReturn: Number(form.payoutDailyReturn),
        totalReturn: Number(form.totalReturn),
        imagePath: form.imagePath || undefined,
        features: form.features
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        isActive: form.isActive,
      })
      toast.success(form.id ? 'Plan updated' : 'Plan created')
      setForm(emptyForm)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this plan? This cannot be undone.')) return
    try {
      await deletePlan(id)
      toast.success('Plan deleted')
      if (form.id === id) setForm(emptyForm)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Investment Plans</h2>
        <p>Create and update plans. Display % is shown on the website; payout % is what users actually receive daily. Use 365 days for continuous earning (no monthly principal refund).</p>
      </header>

      <form className="table-card plan-form" onSubmit={onSubmit}>
        <h3>{form.id ? `Edit Plan #${form.id}` : 'Create New Plan'}</h3>
        <div className="plan-grid">
          <input
            placeholder="Plan Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Min Amount"
            value={form.minAmount}
            onChange={(e) => setForm((prev) => ({ ...prev, minAmount: e.target.value }))}
            required
          />
          <input
            type="number"
            placeholder="Max Amount (blank = unlimited)"
            value={form.maxAmount}
            onChange={(e) => setForm((prev) => ({ ...prev, maxAmount: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Duration Days"
            value={form.durationDays}
            onChange={(e) => setForm((prev) => ({ ...prev, durationDays: e.target.value }))}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Display Daily Return % (website)"
            value={form.dailyReturn}
            onChange={(e) => setForm((prev) => ({ ...prev, dailyReturn: e.target.value }))}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Actual Payout Daily % (wallet credit)"
            value={form.payoutDailyReturn}
            onChange={(e) => setForm((prev) => ({ ...prev, payoutDailyReturn: e.target.value }))}
            required
          />
          <input
            type="number"
            placeholder="Total Return %"
            value={form.totalReturn}
            onChange={(e) => setForm((prev) => ({ ...prev, totalReturn: e.target.value }))}
            required
          />
          <input type="file" accept="image/*" onChange={onImageUpload} disabled={uploadingImage} />
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active plan
          </label>
        </div>
        {form.imagePath ? (
          <p className="muted small">
            Image path: <code>{form.imagePath}</code>
          </p>
        ) : null}
        <textarea
          placeholder="Features comma separated, e.g. 24/7 support, Fast activation"
          value={form.features}
          onChange={(e) => setForm((prev) => ({ ...prev, features: e.target.value }))}
          rows={3}
        />
        <div className="plan-actions">
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? 'Saving...' : form.id ? 'Update Plan' : 'Create Plan'}
          </button>
          <button
            type="button"
            className="secondary-btn reset-btn"
            onClick={() => setForm(emptyForm)}
            disabled={saving}
          >
            Reset Form
          </button>
        </div>
      </form>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Min</th>
              <th>Max</th>
              <th>Days</th>
              <th>Display %</th>
              <th>Payout %</th>
              <th>Total %</th>
              <th>Image</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.id}</td>
                <td>{plan.name}</td>
                <td>{plan.slug}</td>
                <td>${Number(plan.minAmount).toFixed(2)}</td>
                <td>{plan.maxAmount == null ? 'Unlimited' : `$${Number(plan.maxAmount).toFixed(2)}`}</td>
                <td>{Number(plan.durationDays)}</td>
                <td>{Number(plan.dailyReturn).toFixed(2)}%</td>
                <td>{Number(plan.payoutDailyReturn ?? plan.dailyReturn).toFixed(2)}%</td>
                <td>{Number(plan.totalReturn).toFixed(2)}%</td>
                <td>{plan.imagePath ? <img src={toAssetUrl(plan.imagePath)} alt={plan.name} width={42} height={28} /> : '-'}</td>
                <td>{plan.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button className="mini-btn" onClick={() => onEdit(plan)}>
                    Edit
                  </button>
                  <button className="mini-btn danger-inline" onClick={() => onDelete(plan.id)}>
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

export default PlansPage
