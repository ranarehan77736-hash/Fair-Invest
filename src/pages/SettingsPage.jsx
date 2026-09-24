import { useEffect, useState } from 'react'
import {
  Bell,
  Camera,
  Eye,
  EyeOff,
  Lock,
  Save,
  Shield,
  User,
  Settings,
  KeyRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

function SettingsPage() {
  const { user, updateProfile, changePassword, setTwoFactor, updateNotifications } = useAppContext()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: '',
    currentPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user.isTwoFactorEnabled,
  })
  const [message, setMessage] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [notifications, setNotifications] = useState({
    email: user.settings?.emailNotifications ?? true,
    sms: user.settings?.smsNotifications ?? false,
    investments: user.settings?.investmentUpdates ?? true,
    referrals: user.settings?.referralActivity ?? true,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
      phone: user.phone,
      twoFactorEnabled: user.isTwoFactorEnabled,
    }))
    setNotifications({
      email: user.settings?.emailNotifications ?? true,
      sms: user.settings?.smsNotifications ?? false,
      investments: user.settings?.investmentUpdates ?? true,
      referrals: user.settings?.referralActivity ?? true,
    })
  }, [user])

  const handleNotificationToggle = async (key) => {
    const next = { ...notifications, [key]: !notifications[key] }
    setNotifications(next)
    const response = await updateNotifications({
      emailNotifications: next.email,
      smsNotifications: next.sms,
      investmentUpdates: next.investments,
      referralActivity: next.referrals,
    })
    if (!response.ok) toast.error(response.message)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const response = await updateProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
    })
    setSubmitting(false)
    if (response.ok) {
      setMessage('Settings saved successfully.')
      toast.success('Profile saved successfully!')
      return
    }
    setMessage(response.message)
    toast.error(response.message)
  }

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  const Toggle = ({ checked, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '999px',
        padding: '2px',
        border: 'none',
        cursor: 'pointer',
        background: checked
          ? 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)'
          : (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'),
        transition: 'background 0.25s ease',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        boxShadow: checked ? '0 4px 12px rgba(94, 126, 55, 0.3)' : 'none',
      }}
    >
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '999px',
          background: '#ffffff',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
          transform: checked ? 'translateX(22px)' : 'translateX(0)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </button>
  )

  return (
    <section className="page-grid settings-page" style={{ width: '100%', maxWidth: '100%', gap: '1.8rem' }}>
      {/* Header Card */}
      <div
        className="glass-card settings-header"
        style={{
          width: '100%',
          maxWidth: '100%',
          padding: '1.6rem 1.8rem',
          borderRadius: '24px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(18, 24, 18, 0.96) 0%, rgba(30, 44, 30, 0.85) 100%)'
            : 'radial-gradient(ellipse at 15% 15%, rgba(132, 169, 90, 0.18) 0%, transparent 45%), linear-gradient(180deg, #ffffff 0%, #f4f8f2 60%, #e6f0e0 100%)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.3)',
          boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(94, 126, 55, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
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
            <Settings size={24} />
          </div>
          <div>
            <h2 className="page-title" style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14', letterSpacing: '-0.02em' }}>
              Account Settings
            </h2>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.9rem', color: isDark ? '#9ca899' : '#526352' }}>
              Manage your personal profile, account security, and notification preferences.
            </p>
          </div>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: isDark ? 'rgba(132, 169, 90, 0.18)' : 'rgba(94, 126, 55, 0.12)',
            color: isDark ? '#9bc268' : '#5e7e37',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.28)',
          }}
        >
          <Shield size={14} /> Account Verified
        </span>
      </div>

      {/* Profile Information Card */}
      <form
        className="glass-card settings-section"
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '100%',
          padding: '1.8rem',
          borderRadius: '24px',
          background: isDark ? 'rgba(18, 24, 18, 0.94)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.28)',
          boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(94, 126, 55, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)', color: '#ffffff', display: 'grid', placeItems: 'center' }}>
            <User size={20} />
          </div>
          <h3 className="section-title" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
            Profile Information
          </h3>
        </div>

        <div className="profile-top" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', paddingBottom: '0.5rem', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(122, 159, 76, 0.15)' }}>
          <div
            className="profile-avatar"
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.8rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(94, 126, 55, 0.35)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => toast.info('Photo upload is enabled for verified profiles.')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: isDark ? 'rgba(132, 169, 90, 0.16)' : 'rgba(122, 159, 76, 0.12)',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.25)',
                color: isDark ? '#9bc268' : '#5e7e37',
                cursor: 'pointer',
                width: 'fit-content',
              }}
            >
              <Camera size={14} /> Change Photo
            </button>
            <p className="muted small" style={{ margin: 0, fontSize: '0.8rem', color: isDark ? '#9ca899' : '#526352' }}>
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>

        <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#f0f4ef' : '#141e14', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              style={{
                width: '100%',
                height: '46px',
                padding: '0 1rem',
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.3)',
                color: isDark ? '#f0f4ef' : '#141e14',
                fontSize: '0.92rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#f0f4ef' : '#141e14', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              style={{
                width: '100%',
                height: '46px',
                padding: '0 1rem',
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.3)',
                color: isDark ? '#f0f4ef' : '#141e14',
                fontSize: '0.92rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#f0f4ef' : '#141e14', marginBottom: '0.4rem' }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
              style={{
                width: '100%',
                height: '46px',
                padding: '0 1rem',
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.3)',
                color: isDark ? '#f0f4ef' : '#141e14',
                fontSize: '0.92rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#f0f4ef' : '#141e14', marginBottom: '0.4rem' }}>
              Country
            </label>
            <input
              value="Pakistan"
              readOnly
              style={{
                width: '100%',
                height: '46px',
                padding: '0 1rem',
                borderRadius: '14px',
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                color: isDark ? '#9ca899' : '#526352',
                fontSize: '0.92rem',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
          <button
            className="btn btn-primary settings-action-btn"
            type="submit"
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.6rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.92rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(94, 126, 55, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <Save size={16} /> Save Changes
          </button>
          {message ? (
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#9bc268' : '#5e7e37' }}>
              {message}
            </span>
          ) : null}
        </div>
      </form>

      {/* Security & Password Card */}
      <div
        className="glass-card settings-section"
        style={{
          width: '100%',
          maxWidth: '100%',
          padding: '1.8rem',
          borderRadius: '24px',
          background: isDark ? 'rgba(18, 24, 18, 0.94)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.28)',
          boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(94, 126, 55, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #386b54 0%, #529677 100%)', color: '#ffffff', display: 'grid', placeItems: 'center' }}>
            <KeyRound size={20} />
          </div>
          <h3 className="section-title" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
            Security & Password Update
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#f0f4ef' : '#141e14', marginBottom: '0.4rem' }}>
              Current Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '1rem',
                  paddingRight: '42px',
                  borderRadius: '14px',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                  border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.3)',
                  color: isDark ? '#f0f4ef' : '#141e14',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((s) => !s)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: isDark ? '#9ca899' : '#526352', cursor: 'pointer', padding: 0 }}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#f0f4ef' : '#141e14', marginBottom: '0.4rem' }}>
              New Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password (8+ chars)"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '1rem',
                  paddingRight: '42px',
                  borderRadius: '14px',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                  border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.3)',
                  color: isDark ? '#f0f4ef' : '#141e14',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((s) => !s)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: isDark ? '#9ca899' : '#526352', cursor: 'pointer', padding: 0 }}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#f0f4ef' : '#141e14', marginBottom: '0.4rem' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '1rem',
                  paddingRight: '42px',
                  borderRadius: '14px',
                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                  border: isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.3)',
                  color: isDark ? '#f0f4ef' : '#141e14',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: isDark ? '#9ca899' : '#526352', cursor: 'pointer', padding: 0 }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            className="btn btn-cyan settings-action-btn"
            type="button"
            onClick={async () => {
              if (!form.password || form.password.length < 8) {
                toast.error('New password must be at least 8 characters.')
                return
              }
              if (!form.currentPassword) {
                toast.error('Enter your current password.')
                return
              }
              if (form.password !== form.confirmPassword) {
                toast.error('New password and confirm password do not match.')
                return
              }
              const response = await changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.password,
              })
              if (response.ok) {
                toast.success(response.message)
                setForm((prev) => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }))
              } else toast.error(response.message)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.6rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #386b54 0%, #529677 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.92rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(56, 107, 84, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <Lock size={16} /> Change Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication Card */}
      <div
        className="glass-card settings-section"
        style={{
          width: '100%',
          maxWidth: '100%',
          padding: '1.8rem',
          borderRadius: '24px',
          background: isDark ? 'rgba(18, 24, 18, 0.94)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.28)',
          boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(94, 126, 55, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #8c6e28 0%, #b89438 100%)', color: '#ffffff', display: 'grid', placeItems: 'center' }}>
            <Shield size={20} />
          </div>
          <h3 className="section-title" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
            Two-Factor Authentication
          </h3>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.2rem 1.4rem',
            borderRadius: '18px',
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.22)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div>
            <strong style={{ display: 'block', fontSize: '1rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
              Enable 2FA Protection
            </strong>
            <p className="muted" style={{ margin: '3px 0 0', fontSize: '0.86rem', color: isDark ? '#9ca899' : '#526352' }}>
              Add an extra layer of biometric or OTP security to your investor profile.
            </p>
          </div>
          <Toggle
            checked={form.twoFactorEnabled}
            onClick={async () => {
              const next = !form.twoFactorEnabled
              setForm((prev) => ({ ...prev, twoFactorEnabled: next }))
              const response = await setTwoFactor(next)
              if (response.ok) toast.success(response.message)
              else toast.error(response.message)
            }}
          />
        </div>
      </div>

      {/* Notifications Preferences Card */}
      <div
        className="glass-card settings-section"
        style={{
          width: '100%',
          maxWidth: '100%',
          padding: '1.8rem',
          borderRadius: '24px',
          background: isDark ? 'rgba(18, 24, 18, 0.94)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.28)',
          boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(94, 126, 55, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.2rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)', color: '#ffffff', display: 'grid', placeItems: 'center' }}>
            <Bell size={20} />
          </div>
          <h3 className="section-title" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
            Notification Preferences
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
          {[
            {
              id: 'email',
              title: 'Email Notifications',
              desc: 'Receive transaction receipts & yield alerts via email',
            },
            {
              id: 'sms',
              title: 'SMS Notifications',
              desc: 'Receive critical security OTPs & login SMS alerts',
            },
            {
              id: 'investments',
              title: 'Investment Updates',
              desc: 'Get live daily return payouts & plan maturity alerts',
            },
            {
              id: 'referrals',
              title: 'Referral Activity',
              desc: 'Get notified when someone registers via your referral link',
            },
          ].map((item) => (
            <article
              key={item.id}
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                padding: '1.2rem',
                borderRadius: '18px',
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.22)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.96rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14' }}>
                  {item.title}
                </strong>
                <p className="muted" style={{ margin: '3px 0 0', fontSize: '0.82rem', color: isDark ? '#9ca899' : '#526352' }}>
                  {item.desc}
                </p>
              </div>
              <Toggle
                checked={notifications[item.id]}
                onClick={() => handleNotificationToggle(item.id)}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SettingsPage
