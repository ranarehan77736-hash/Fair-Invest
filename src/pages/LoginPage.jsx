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
                {supportedSocialLinks.map((link, idx) => (
                  <a
                    key={link.id || link.platform || idx}
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

            <p style={{ textAlign: 'center', fontSize: '0.86rem', color: subtitleColor, margin: '4px 0 0 0', transition: 'color 0.25s ease' }}>
              New to FairInvest?{' '}
              <Link to="/signup" style={{ color: accentColor, fontWeight: 700, textDecoration: 'none' }}>
                Create Free Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
