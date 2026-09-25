import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Gift, Lock, Mail, Phone, ShieldCheck, Sparkles, User, Users, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { FaWhatsapp } from 'react-icons/fa6'
import { getSupportedSocialLinks } from '../lib/socialPlatforms.js'
import FairInvestLogo from '../components/FairInvestLogo.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

function SignUpPage() {
  const navigate = useNavigate()
  const { signup, socialLinks } = useAppContext()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const supportedSocialLinks = getSupportedSocialLinks(socialLinks)
  const whatsappLink = supportedSocialLinks.find((item) => item.platform === 'whatsapp')
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referralCode: searchParams.get('ref') || '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    const response = await signup(form)
    setSubmitting(false)
    if (response.ok) {
      toast.success(response.message)
      navigate('/dashboard')
      return
    }
    setError(response.message)
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

  const btnGradient = isDark
    ? 'linear-gradient(135deg, #7a9f4c 0%, #5e7e37 50%, #84a95a 100%)'
    : 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 50%, #4d6928 100%)'

  const btnShadow = isDark
    ? '0 10px 32px rgba(122, 159, 76, 0.45), 0 0 22px rgba(132, 169, 90, 0.25)'
    : '0 8px 25px rgba(94, 126, 55, 0.35), 0 2px 10px rgba(122, 159, 76, 0.2)'

  return (
    <div
      className="auth-page premium-bg signup-page"
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
      {/* Background Orbs */}
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
          opacity: isDark ? 0.2 : 0.35,
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
          background: isDark ? '#5e7e37' : '#9bc268',
          borderRadius: '999px',
          filter: 'blur(100px)',
          opacity: isDark ? 0.2 : 0.3,
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
        {/* Left Side — Showcase Pane */}
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
              <Sparkles size={13} /> VIP Portfolio Portal
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
              }}
            >
              Empower Your Future. <br />
              <span style={{ color: isDark ? '#9bc268' : '#5e7e37', fontWeight: 800 }}>
                High-Yield Capital Engine.
              </span>
            </h1>
            <p style={{ fontSize: '0.98rem', color: subtitleColor, lineHeight: 1.65, margin: 0, maxWidth: '460px' }}>
              Join thousands of smart global investors earning automated daily yields with bank-grade custody and zero hidden fees.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.92rem', color: textColor, fontWeight: 500 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: badgeBg, border: badgeBorder, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <span>Institutional Asset Custody & Security</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.92rem', color: textColor, fontWeight: 500 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: badgeBg, border: badgeBorder, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={20} />
              </div>
              <span>Instant Daily Automated Yield Distribution</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.92rem', color: textColor, fontWeight: 500 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: badgeBg, border: badgeBorder, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={20} />
              </div>
              <span>Global Partner Rewards & Referral Network</span>
            </div>
          </div>

          {supportedSocialLinks.length ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '18px', borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: subtitleColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Follow Us</span>
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

        {/* Right Side — Sign Up Form Card */}
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
              gap: '1.25rem',
              transition: 'all 0.3s ease',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: titleColor, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                Register Account
              </h2>
              <p style={{ fontSize: '0.9rem', color: subtitleColor, margin: 0 }}>
                Create your verified FairInvest investor profile in under 60 seconds.
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
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#22c55e', color: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  <FaWhatsapp size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: '0.84rem', color: titleColor, fontWeight: 700 }}>Join FairInvest Official Channel</strong>
                  <span style={{ fontSize: '0.74rem', color: subtitleColor }}>Receive VIP signals & community announcements</span>
                </div>
              </a>
            ) : null}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Legal Full Name"
                type="text"
                icon={User}
                placeholder="e.g. Alexander Vance"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />

              <Input
                label="Primary Email"
                type="email"
                icon={Mail}
                placeholder="alexander@example.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />

              <Input
                label="Mobile Phone"
                type="tel"
                icon={Phone}
                placeholder="+1 (555) 000-8888"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />

              <Input
                label="Secure Password"
                isPassword
                icon={Lock}
                placeholder="8+ characters required"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />

              <Input
                label="Invitation Code (Optional)"
                type="text"
                icon={Gift}
                placeholder="Enter referral code if available"
                value={form.referralCode}
                onChange={(e) => setForm((prev) => ({ ...prev, referralCode: e.target.value }))}
              />

              {error && (
                <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.84rem', fontWeight: 600 }}>
                  {error}
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
                }}
              >
                Launch Your Investor Account
              </Button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.86rem', color: subtitleColor, margin: '4px 0 0 0' }}>
              Already registered with FairInvest?{' '}
              <Link to="/login" style={{ color: accentColor, fontWeight: 700, textDecoration: 'none' }}>
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignUpPage
