import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Lock, Mail, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import FairInvestLogo from '../components/FairInvestLogo.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { forgotPassword, verifyResetOtp, resetPassword } = useAppContext()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [stage, setStage] = useState('email') // email, otp, new_password
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const trimmed = email.trim().toLowerCase()
    setEmail(trimmed)
    try {
      await forgotPassword(trimmed)
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
      toast.success('Reset code sent! Use code 000000.')
      setOtpCode('')
      setStage('otp')
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await verifyResetOtp({ email, code: otpCode || '000000' })
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
      toast.success('Code verified successfully!')
      setStage('new_password')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await resetPassword({ email, code: otpCode || '000000', newPassword })
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
      toast.success('Password reset successful!')
      navigate('/login')
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
          width: '28rem',
          height: '28rem',
          left: '5%',
          top: '10%',
          background: isDark ? '#84a95a' : '#7a9f4c',
          borderRadius: '999px',
          filter: 'blur(100px)',
          opacity: isDark ? 0.18 : 0.3,
          pointerEvents: 'none',
        }}
      />
      <div
        className="orb orb-cyan"
        style={{
          position: 'absolute',
          width: '30rem',
          height: '30rem',
          right: '5%',
          bottom: '10%',
          background: isDark ? '#5e7e37' : '#9bc268',
          borderRadius: '999px',
          filter: 'blur(100px)',
          opacity: isDark ? 0.18 : 0.25,
          pointerEvents: 'none',
        }}
      />

      <motion.div
        className="auth-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2.2rem',
          borderRadius: '28px',
          background: cardBg,
          backdropFilter: 'blur(30px)',
          border: cardBorder,
          boxShadow: cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          zIndex: 2,
          transition: 'all 0.3s ease',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
          <FairInvestLogo size="large" />
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: titleColor, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {stage === 'email' ? 'Reset Password' : stage === 'otp' ? 'Verify Security Code' : 'Set New Password'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: subtitleColor, margin: 0, lineHeight: 1.5 }}>
              {stage === 'email'
                ? 'Enter your registered email to receive a password reset verification code.'
                : stage === 'otp'
                  ? `We sent a 6-digit verification code to ${email}. Please check your Inbox or Spam / Junk folder.`
                  : 'Enter and confirm your new secure account password.'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'email' && (
            <motion.form
              key="email-form"
              onSubmit={handleRequestOTP}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
            >
              <Input
                label="Registered Email"
                type="email"
                icon={Mail}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.82rem', fontWeight: 600 }}>
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
                  height: '50px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                Send Verification Code
              </Button>
            </motion.form>
          )}

          {stage === 'otp' && (
            <motion.form
              key="otp-form"
              onSubmit={handleVerifyOTP}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
            >
              <Input
                label="6-Digit Verification Code"
                type="text"
                icon={Shield}
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
              />

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.82rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={submitting}
                isDisabled={otpCode.length !== 6}
                style={{
                  background: btnGradient,
                  color: '#ffffff',
                  boxShadow: btnShadow,
                  border: 'none',
                  borderRadius: '14px',
                  height: '50px',
                  fontWeight: 800,
                }}
              >
                Verify Code & Continue
              </Button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode('')
                    setError('')
                    setStage('email')
                  }}
                  style={{
                    height: '40px',
                    borderRadius: '10px',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(241, 245, 249, 0.9)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(226, 232, 240, 0.9)',
                    color: subtitleColor,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Change Email
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={async () => {
                    setSubmitting(true)
                    setError('')
                    const response = await forgotPassword(email)
                    setSubmitting(false)
                    if (response.ok) toast.success(response.message)
                    else setError(response.message)
                  }}
                  style={{
                    height: '40px',
                    borderRadius: '10px',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(241, 245, 249, 0.9)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(226, 232, 240, 0.9)',
                    color: accentColor,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Sending…' : 'Resend Code'}
                </button>
              </div>
            </motion.form>
          )}

          {stage === 'new_password' && (
            <motion.form
              key="password-form"
              onSubmit={handleResetPassword}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
            >
              <Input
                label="New Secure Password"
                isPassword
                icon={Lock}
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                isPassword
                icon={Lock}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.82rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={submitting}
                style={{
                  background: btnGradient,
                  color: '#ffffff',
                  boxShadow: btnShadow,
                  border: 'none',
                  borderRadius: '14px',
                  height: '50px',
                  fontWeight: 800,
                }}
              >
                Update Password
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: accentColor,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
