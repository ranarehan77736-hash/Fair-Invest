import { useState } from 'react'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'
import { useTheme } from '../state/ThemeContext.jsx'
import FairInvestLogo from '../components/FairInvestLogo.jsx'
import { Lock, Mail, Moon, ShieldCheck, Sun } from 'lucide-react'

function LoginPage() {
  const { login } = useAdmin()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    const result = await login({ email, password })
    setLoading(false)
    if (result.ok) toast.success(result.message)
    else toast.error(result.message)
  }

  const pageBg = isDark
    ? 'linear-gradient(140deg, #090c09 0%, #121812 40%, #0c120c 75%, #090c09 100%)'
    : 'radial-gradient(ellipse at 15% 15%, rgba(132, 169, 90, 0.18) 0%, transparent 45%), linear-gradient(180deg, #f3f7f0 0%, #e6f0e0 40%, #f4f8f2 100%)'

  const cardBg = isDark
    ? 'rgba(18, 24, 18, 0.92)'
    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)'

  const cardBorder = isDark
    ? '1px solid rgba(132, 169, 90, 0.35)'
    : '1px solid rgba(122, 159, 76, 0.28)'

  const cardShadow = isDark
    ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(132, 169, 90, 0.15)'
    : '0 25px 55px rgba(94, 126, 55, 0.15), 0 10px 25px rgba(0, 0, 0, 0.05)'

  const titleColor = isDark ? '#f0f4ef' : '#141e14'
  const subtitleColor = isDark ? '#9ca899' : '#526352'
  const inputBg = isDark ? 'rgba(20, 28, 20, 0.85)' : '#ffffff'
  const inputBorder = isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.3)'
  const inputText = isDark ? '#ffffff' : '#141e14'
  const iconColor = isDark ? '#84a95a' : '#5e7e37'

  return (
    <div
      className="admin-login-page"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: pageBg,
        padding: '1.5rem',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Top Right Theme Toggle Option */}
      <button
        onClick={toggleTheme}
        type="button"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '999px',
          background: isDark ? 'rgba(132, 169, 90, 0.16)' : 'rgba(122, 159, 76, 0.16)',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.35)',
          color: isDark ? '#9bc268' : '#5e7e37',
          fontSize: '0.84rem',
          fontWeight: 700,
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.25s ease',
          zIndex: 10,
          boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.06)',
        }}
        aria-label="Toggle Theme"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>

      {/* Background Ambient Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '20rem',
          height: '20rem',
          left: '10%',
          top: '15%',
          background: isDark ? '#84a95a' : '#7a9f4c',
          borderRadius: '999px',
          filter: 'blur(90px)',
          opacity: isDark ? 0.2 : 0.18,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '20rem',
          height: '20rem',
          right: '10%',
          bottom: '15%',
          background: isDark ? '#6b8d40' : '#84a95a',
          borderRadius: '999px',
          filter: 'blur(90px)',
          opacity: isDark ? 0.18 : 0.15,
          pointerEvents: 'none',
        }}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          background: cardBg,
          backdropFilter: 'blur(20px)',
          border: cardBorder,
          boxShadow: cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem',
          zIndex: 2,
          boxSizing: 'border-box',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
          <FairInvestLogo size="large" />
          <div style={{ marginTop: '0.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: titleColor, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'color 0.25s ease' }}>
              Admin Control Portal
            </h2>
            <p style={{ fontSize: '0.82rem', color: subtitleColor, margin: '4px 0 0 0', transition: 'color 0.25s ease' }}>
              Secure Authentication for System Management
            </p>
          </div>
        </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: subtitleColor, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'color 0.25s ease' }}>
                Admin Email
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '48px',
                  borderRadius: '12px',
                  background: inputBg,
                  border: inputBorder,
                  padding: '0 8px 0 14px',
                  gap: '10px',
                  transition: 'all 0.25s ease',
                }}
              >
                <Mail size={18} style={{ color: iconColor, flexShrink: 0 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fairinvest.com"
                  required
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(238, 244, 255, 0.96)',
                    border: 'none',
                    outline: 'none',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    padding: '0 10px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: subtitleColor, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'color 0.25s ease' }}>
                Password
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '48px',
                  borderRadius: '12px',
                  background: inputBg,
                  border: inputBorder,
                  padding: '0 8px 0 14px',
                  gap: '10px',
                  transition: 'all 0.25s ease',
                }}
              >
                <Lock size={18} style={{ color: iconColor, flexShrink: 0 }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    flex: 1,
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(238, 244, 255, 0.96)',
                    border: 'none',
                    outline: 'none',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    padding: '0 10px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #7a9f4c 0%, #5e7e37 50%, #84a95a 100%)',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.98rem',
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(122, 159, 76, 0.45)',
            marginTop: '0.5rem',
            letterSpacing: '0.02em',
          }}
        >
          <ShieldCheck size={18} />
          {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
