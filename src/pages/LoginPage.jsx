import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { FaWhatsapp } from 'react-icons/fa6'
import { getSupportedSocialLinks } from '../lib/socialPlatforms.js'
import FairInvestLogo from '../components/FairInvestLogo.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

function LoginPage() {
  const navigate = useNavigate()
  const { login, googleAuth, socialLinks } = useAppContext()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const supportedSocialLinks = getSupportedSocialLinks(socialLinks)
  const whatsappLink = supportedSocialLinks.find((item) => item.platform === 'whatsapp')

  const [keepSignedIn, setKeepSignedIn] = useState(() => {
    return localStorage.getItem('fairinvest-remember-me') !== 'false'
  })

  const [form, setForm] = useState(() => {
    const savedEmail = localStorage.getItem('fairinvest-saved-email') || ''
    const savedPassword = localStorage.getItem('fairinvest-saved-password') || ''
    return {
      email: savedEmail,
      password: savedPassword,
    }
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')
  const [googlePassword, setGooglePassword] = useState('')
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false)

  const handleEmailChange = (e) => {
    const val = e.target.value
    setForm((prev) => ({ ...prev, email: val }))
    if (keepSignedIn) {
      localStorage.setItem('fairinvest-saved-email', val)
    }
  }

  const handlePasswordChange = (e) => {
    const val = e.target.value
    setForm((prev) => ({ ...prev, password: val }))
    if (keepSignedIn) {
      localStorage.setItem('fairinvest-saved-password', val)
    }
  }

  const handleKeepSignedInToggle = (e) => {
    const checked = e.target.checked
    setKeepSignedIn(checked)
    localStorage.setItem('fairinvest-remember-me', checked ? 'true' : 'false')
    if (checked) {
      localStorage.setItem('fairinvest-saved-email', form.email)
      localStorage.setItem('fairinvest-saved-password', form.password)
    } else {
      localStorage.removeItem('fairinvest-saved-email')
      localStorage.removeItem('fairinvest-saved-password')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMsg('')
    setSubmitting(true)

    if (keepSignedIn) {
      localStorage.setItem('fairinvest-remember-me', 'true')
      localStorage.setItem('fairinvest-saved-email', form.email)
      localStorage.setItem('fairinvest-saved-password', form.password)
    }

    const response = await login(form)
    setSubmitting(false)
    if (response.ok) {
      toast.success(response.message || 'Login successful!')
      navigate('/dashboard')
      return
    }
    setErrorMsg(response.message || 'Invalid email or password')
    toast.error(response.message || 'Invalid email or password')
  }

  const handleGoogleSubmit = async (event) => {
    if (event) event.preventDefault()
    if (!googleEmail.trim()) {
      toast.error('Please enter your Google Email or Phone.')
      return
    }
    if (!googlePassword) {
      toast.error('Please enter your Google Password.')
      return
    }
    setGoogleAuthLoading(true)
    const res = await googleAuth(googleEmail, googlePassword)
    setGoogleAuthLoading(false)
    if (res.ok) {
      toast.success(`Signed in with Google as ${googleEmail}!`)
      setShowGoogleModal(false)
      navigate('/dashboard')
    } else {
      toast.error(res.message || 'Google sign in failed.')
    }
  }

  // Theme Palette Config — Stealth Olive Theme (Light & Dark)
  const pageBg = isDark
    ? 'radial-gradient(ellipse at 15% 15%, rgba(132, 169, 90, 0.22) 0%, transparent 45%), radial-gradient(ellipse at 85% 85%, rgba(94, 126, 55, 0.22) 0%, transparent 45%), linear-gradient(140deg, #090c09 0%, #121812 40%, #0c120c 75%, #090c09 100%)'
    : 'radial-gradient(ellipse at 15% 15%, rgba(132, 169, 90, 0.18) 0%, transparent 45%), radial-gradient(ellipse at 85% 85%, rgba(94, 126, 55, 0.15) 0%, transparent 45%), linear-gradient(180deg, #f3f7f0 0%, #e6f0e0 40%, #f4f8f2 100%)'

  const cardBg = isDark
    ? 'rgba(18, 24, 18, 0.92)'
    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)'

  const cardBorder = isDark
    ? '1px solid rgba(132, 169, 90, 0.35)'
    : '1px solid rgba(122, 159, 76, 0.28)'

  const cardShadow = isDark
    ? '0 25px 65px rgba(0, 0, 0, 0.95), 0 0 45px rgba(132, 169, 90, 0.22), 0 0 20px rgba(112, 151, 68, 0.18)'
    : '0 25px 55px rgba(94, 126, 55, 0.15), 0 10px 25px rgba(0, 0, 0, 0.05)'

  const titleColor = isDark ? '#f0f4ef' : '#141e14'
  const subtitleColor = isDark ? '#9ca899' : '#526352'
  const accentColor = isDark ? '#9bc268' : '#5e7e37'
  const textColor = isDark ? '#cbd5e1' : '#233023'

  const badgeBg = isDark ? 'rgba(132, 169, 90, 0.18)' : 'rgba(122, 159, 76, 0.14)'
  const badgeBorder = isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid rgba(122, 159, 76, 0.3)'

  const whatsappBg = isDark ? 'rgba(132, 169, 90, 0.14)' : 'rgba(122, 159, 76, 0.12)'
  const whatsappBorder = isDark ? '1px solid rgba(132, 169, 90, 0.3)' : '1px solid rgba(122, 159, 76, 0.25)'

  const socialBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'
  const socialBorder = isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.25)'

  const directAuthBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'
  const directAuthBorder = isDark ? '1px solid rgba(132, 169, 90, 0.2)' : '1px solid rgba(122, 159, 76, 0.2)'

  const btnGradient = isDark
    ? 'linear-gradient(135deg, #7a9f4c 0%, #5e7e37 50%, #84a95a 100%)'
    : 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 50%, #4d6928 100%)'

  const btnShadow = isDark
    ? '0 10px 32px rgba(122, 159, 76, 0.45), 0 0 22px rgba(132, 169, 90, 0.25)'
    : '0 8px 25px rgba(94, 126, 55, 0.35), 0 2px 10px rgba(122, 159, 76, 0.2)'

  return (
    <div
      className="auth-page premium-bg"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        background: pageBg,
        transition: 'background 0.3s ease',
      }}
    >
      {/* Background Glowing Ambient Orbs */}
      <div
        className="orb orb-emerald"
        style={{
          position: 'absolute',
          width: '32rem',
          height: '32rem',
          left: '2%',
          top: '5%',
          background: isDark ? '#84a95a' : '#7a9f4c',
          borderRadius: '999px',
          filter: 'blur(100px)',
          opacity: isDark ? 0.25 : 0.2,
          pointerEvents: 'none',
        }}
      />
      <div
        className="orb orb-cyan"
        style={{
          position: 'absolute',
          width: '34rem',
          height: '34rem',
          right: '2%',
          bottom: '5%',
          background: isDark ? '#6b8d40' : '#84a95a',
          borderRadius: '999px',
          filter: 'blur(100px)',
          opacity: isDark ? 0.22 : 0.18,
          pointerEvents: 'none',
        }}
      />

      <div
        className="auth-grid"
        style={{
          width: '100%',
          maxWidth: '1080px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        {/* Left Side — FairInvest.com Brand Showcase Pane */}
        <motion.section
          className="brand-pane"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', color: titleColor }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FairInvestLogo size="large" />
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: badgeBg,
                border: badgeBorder,
                color: accentColor,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={13} /> Institutional Grade
            </span>
          </div>

          <div>
            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 800,
                lineHeight: 1.18,
                color: titleColor,
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em',
                transition: 'color 0.25s ease',
              }}
            >
              Next-Gen Wealth Growth <br />
              <span
                style={{
                  display: 'inline-block',
                  color: isDark ? '#9bc268' : '#0284c7',
                  fontWeight: 800,
                  transition: 'color 0.25s ease',
                }}
              >
                Fair. Transparent. Yield.
              </span>
            </h1>
            <p
              style={{
                fontSize: '0.98rem',
                color: subtitleColor,
                lineHeight: 1.65,
                margin: 0,
                maxWidth: '460px',
                transition: 'color 0.25s ease',
              }}
            >
              Empowering smart investors with algorithmic profit distributions, real-time portfolio analytics, and 100% verified asset transparency.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '6px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '0.92rem',
                color: textColor,
                fontWeight: 500,
                transition: 'color 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: badgeBg,
                  border: badgeBorder,
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <span>Institutional Security & Zero-Trust Protocol</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '0.92rem',
                color: textColor,
                fontWeight: 500,
                transition: 'color 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: badgeBg,
                  border: badgeBorder,
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TrendingUp size={20} />
              </div>
              <span>Automated Daily Profit Settlement</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '0.92rem',
                color: textColor,
                fontWeight: 500,
                transition: 'color 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: badgeBg,
                  border: badgeBorder,
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Users size={20} />
              </div>
              <span>Multi-Tier Partner Rewards & Commissions</span>
            </div>
          </div>

          {supportedSocialLinks.length ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                paddingTop: '18px',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.1)',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  color: subtitleColor,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Follow Us
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {supportedSocialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: socialBg,
                      border: socialBorder,
                      color: subtitleColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                      boxShadow: isDark ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                    }}
                    aria-label={link.label}
                  >
                    <link.Icon size={17} />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </motion.section>

        {/* Right Side — Sign In Card Form */}
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ width: '100%' }}
        >
          <div
            className="glass-card"
            style={{
              padding: '2.5rem 2.2rem',
              borderRadius: '28px',
              background: cardBg,
              backdropFilter: 'blur(30px)',
              border: cardBorder,
              boxShadow: cardShadow,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.35rem',
              transition: 'all 0.3s ease',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: titleColor,
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.02em',
                  transition: 'color 0.25s ease',
                }}
              >
                Access Your Account
              </h2>
              <p style={{ fontSize: '0.9rem', color: subtitleColor, margin: 0, transition: 'color 0.25s ease' }}>
                Secure authentication to access your FairInvest portfolio.
              </p>
            </div>

            {whatsappLink?.url ? (
              <a
                href={whatsappLink.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: whatsappBg,
                  border: whatsappBorder,
                  color: isDark ? '#9bc268' : '#5e7e37',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#22c55e',
                    color: '#090d16',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <FaWhatsapp size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: '0.84rem', color: titleColor, fontWeight: 700, transition: 'color 0.25s ease' }}>
                    Join FairInvest Official Channel
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: subtitleColor, transition: 'color 0.25s ease' }}>
                    Receive VIP signals & instant community updates
                  </span>
                </div>
              </a>
            ) : null}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <Input
                label="Registered Email"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleEmailChange}
                required
              />

              <Input
                label="Account Password"
                isPassword
                icon={Lock}
                placeholder="••••••••"
                value={form.password}
                onChange={handlePasswordChange}
                required
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', fontSize: '0.82rem', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: subtitleColor }}>
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={handleKeepSignedInToggle}
                    style={{ accentColor: isDark ? '#84a95a' : '#5e7e37', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 500 }}>Keep me signed in</span>
                </label>
                <Link to="/forgot-password" style={{ color: isDark ? '#9bc268' : '#5e7e37', fontWeight: 700, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>

              {errorMsg && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#fb7185',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={submitting}
                icon={ArrowRight}
                iconPosition="right"
                style={{
                  background: btnGradient,
                  color: '#ffffff',
                  boxShadow: btnShadow,
                  border: 'none',
                  borderRadius: '14px',
                  height: '52px',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  letterSpacing: '0.02em',
                  transition: 'all 0.25s ease',
                }}
              >
                Access Your Portfolio
              </Button>
            </form>

            <div style={{ position: 'relative', textAlign: 'center', margin: '8px 0' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.1)',
                }}
              />
              <span
                style={{
                  position: 'relative',
                  padding: '0 12px',
                  background: isDark ? '#121812' : '#e0f2fe',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  color: subtitleColor,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  transition: 'all 0.25s ease',
                }}
              >
                SECURE SINGLE SIGN-ON
              </span>
            </div>

            <div style={{ width: '100%' }}>
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '14px',
                  background: directAuthBg,
                  border: directAuthBorder,
                  color: titleColor,
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.25s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.86rem', color: subtitleColor, margin: '4px 0 0 0', transition: 'color 0.25s ease' }}>
              New to FairInvest?{' '}
              <Link to="/signup" style={{ color: accentColor, fontWeight: 700, textDecoration: 'none' }}>
                Create Free Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Google Sign-In Direct Modal */}
      {showGoogleModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'grid',
            placeItems: 'center',
            padding: '1.25rem',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: 'min(440px, 100%)',
              padding: '2.4rem 2rem 2.2rem',
              borderRadius: '24px',
              background: isDark ? '#181f18' : '#ffffff',
              border: isDark ? '1px solid rgba(132, 169, 90, 0.35)' : '1px solid #e2e8f0',
              boxShadow: isDark
                ? '0 25px 65px rgba(0, 0, 0, 0.95), 0 0 45px rgba(132, 169, 90, 0.2)'
                : '0 25px 50px rgba(0, 0, 0, 0.18)',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              style={{
                position: 'absolute',
                top: '1.1rem',
                right: '1.1rem',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid #cbd5e1',
                background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                color: isDark ? '#9ca899' : '#64748b',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              ✕
            </button>

            {/* Google Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: titleColor }}>
                Sign in with Google
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: subtitleColor }}>
                to continue to <strong style={{ color: accentColor }}>FairInvest.com</strong>
              </p>
            </div>

            {/* Direct Email & Password Form */}
            <form onSubmit={handleGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: subtitleColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Google Email or Phone
                </label>
                <input
                  type="email"
                  placeholder="Enter your Google email (e.g. yourname@gmail.com)"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  required
                  style={{
                    height: '48px',
                    borderRadius: '12px',
                    padding: '0 14px',
                    background: isDark ? 'rgba(20, 28, 20, 0.85)' : '#ffffff',
                    border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid #cbd5e1',
                    color: titleColor,
                    fontSize: '0.94rem',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: subtitleColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Google Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={googlePassword}
                  onChange={(e) => setGooglePassword(e.target.value)}
                  required
                  style={{
                    height: '48px',
                    borderRadius: '12px',
                    padding: '0 14px',
                    background: isDark ? 'rgba(20, 28, 20, 0.85)' : '#ffffff',
                    border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid #cbd5e1',
                    color: titleColor,
                    fontSize: '0.94rem',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={googleAuthLoading}
                style={{
                  height: '50px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  cursor: googleAuthLoading ? 'not-allowed' : 'pointer',
                  opacity: googleAuthLoading ? 0.7 : 1,
                  boxShadow: '0 8px 24px rgba(26, 115, 232, 0.35)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '0.5rem',
                }}
              >
                {googleAuthLoading ? 'Authenticating with Google...' : 'Sign In & Access Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
