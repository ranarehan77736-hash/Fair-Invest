import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'
import { PLATFORM_MAP, PLATFORM_OPTIONS, detectSocialPlatform } from '../lib/socialPlatforms.js'

function SocialLinksPage() {
  const { socialLinks, fetchSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink } = useAdmin()

  const [form, setForm] = useState({
    id: null,
    title: 'whatsapp',
    url: '',
    sortOrder: 0,
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // keep existing edit form if editing an item
  }, [socialLinks])

  useEffect(() => {
    fetchSocialLinks()
  }, [fetchSocialLinks])



  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (form.id) {
        await updateSocialLink(form.id, {
          title: form.title,
          url: form.url,
          sortOrder: Number(form.sortOrder),
          isActive: form.isActive,
        })
        toast.success('Social link updated')
      } else {
        await createSocialLink({
          title: form.title,
          url: form.url,
          sortOrder: Number(form.sortOrder),
          isActive: form.isActive,
        })
        toast.success('Social link created')
      }
      setForm({ id: null, title: 'whatsapp', url: '', sortOrder: 0, isActive: true })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (item) =>
    setForm({
      id: item.id,
      title: detectSocialPlatform(item),
      url: item.url,
      sortOrder: item.sortOrder || 0,
      isActive: !!item.isActive,
    })

  const onDelete = async (id) => {
    if (!window.confirm('Delete this social link?')) return
    try {
      await deleteSocialLink(id)
      toast.success('Social link deleted')
      if (form.id === id) setForm({ id: null, title: 'whatsapp', url: '', sortOrder: 0, isActive: true })
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Social / Community Links</h2>
        <p>Add unlimited custom links with your own title and URL.</p>
      </header>
      <form className="table-card plan-form" onSubmit={onSubmit}>
        <h3>{form.id ? `Edit Link #${form.id}` : 'Add New Link'}</h3>
        <label>Platform</label>
        <div className="admin-platform-grid">
          {PLATFORM_OPTIONS.map((platform) => (
            <button
              key={platform.value}
              type="button"
              className={`admin-platform-btn ${form.title === platform.value ? 'active' : ''}`}
              onClick={() => setForm((prev) => ({ ...prev, title: platform.value }))}
            >
              <platform.Icon size={16} />
              {platform.label}
            </button>
          ))}
        </div>
        <label>Link URL</label>
        <input
          type="url"
          placeholder="https://..."
          value={form.url}
          onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
          required
        />
        <div className="plan-grid">
          <input
            type="number"
            placeholder="Sort Order"
            value={form.sortOrder}
            onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
          />
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active link
          </label>
        </div>
        <div className="plan-actions">
          <button className="primary-btn" disabled={saving}>
            {saving ? 'Saving...' : form.id ? 'Update Link' : 'Add Link'}
          </button>
          <button
            type="button"
            className="mini-btn"
            onClick={() => setForm({ id: null, title: 'whatsapp', url: '', sortOrder: 0, isActive: true })}
          >
            Reset
          </button>
        </div>
      </form>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Platform</th>
              <th>URL</th>
              <th>Order</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(socialLinks.items || []).map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <div className="admin-social-platform">
                    {(() => {
                      const platform = detectSocialPlatform(item)
                      const SocialIcon = PLATFORM_MAP[platform]?.Icon
                      const label = PLATFORM_MAP[platform]?.label || item.title
                      return (
                        <>
                          {SocialIcon ? <SocialIcon size={14} /> : null}
                          <span>{label}</span>
                        </>
                      )
                    })()}
                  </div>
                </td>
                <td>{item.url}</td>
                <td>{item.sortOrder}</td>
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

export default SocialLinksPage
