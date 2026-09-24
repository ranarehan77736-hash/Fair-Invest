import { useState } from 'react'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'
import FairInvestLogo from '../components/FairInvestLogo.jsx'
import { Lock, Mail, ShieldCheck } from 'lucide-react'

function LoginPage() {
  const { login } = useAdmin()
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

  return (
    <div
      className="admin-login-page"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(140deg, #090c09 0%, #121812 40%, #0c120c 75%, #090c09 100%)',
        padding: '1.5rem',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '20rem',
          height: '20rem',
          left: '10%',
          top: '15%',
          background: '#84a95a',
          borderRadius: '999px',
          filter: 'blur(90px)',
          opacity: 0.2,
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
          background: '#6b8d40',
          borderRadius: '999px',
          filter: 'blur(90px)',
          opacity: 0.18,
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
          background: 'rgba(18, 24, 18, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(132, 169, 90, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(132, 169, 90, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem',
          zIndex: 2,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
          <FairInvestLogo size="large" />
          <div style={{ marginTop: '0.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f0f4ef', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              Admin Control Portal
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#9ca899', margin: '4px 0 0 0' }}>
              Secure Authentication for System Management
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9ca899', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Email
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(20, 28, 20, 0.85)',
                border: '1px solid rgba(132, 169, 90, 0.25)',
                padding: '0 14px',
                color: '#ffffff',
                gap: '10px',
              }}
            >
              <Mail size={18} style={{ color: '#84a95a', flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fairinvest.com"
                required
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9ca899', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(20, 28, 20, 0.85)',
                border: '1px solid rgba(132, 169, 90, 0.25)',
                padding: '0 14px',
                color: '#ffffff',
                gap: '10px',
              }}
            >
              <Lock size={18} style={{ color: '#84a95a', flexShrink: 0 }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.92rem',
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
