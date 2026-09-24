import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa6'
import { useAppContext } from '../context/AppContext.jsx'
import { getSupportedSocialLinks } from '../lib/socialPlatforms.js'

function SplashPage() {
  const brandLogo = `${import.meta.env.BASE_URL}logo.png`
  const navigate = useNavigate()
  const { isAuthenticated, socialLinks } = useAppContext()
  const supportedSocialLinks = getSupportedSocialLinks(socialLinks)
  const whatsappLink = supportedSocialLinks.find((item) => item.platform === 'whatsapp')

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })
    }, 700)

    return () => clearTimeout(timer)
  }, [navigate, isAuthenticated])

  const particles = Array.from({ length: 20 })

  return (
    <section className="splash-screen premium-bg">
      <div className="orb orb-emerald" />
      <div className="orb orb-cyan" />
      <div className="orb orb-teal" />
      {particles.map((_, index) => (
        <span
          key={index}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${(index % 6) * 0.4}s`,
            animationDuration: `${3 + (index % 3)}s`,
          }}
        />
      ))}

      <motion.div
        className="splash-content"
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      >
        <motion.div
          className="logo-shell"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <img className="splash-logo-img" src={brandLogo} alt="HorizoneInvest" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          HorizonInvest
        </motion.h1>
        <motion.p
          className="splash-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles size={18} /> Start Investing and Earning Today <Sparkles size={18} />
        </motion.p>
        {whatsappLink?.url ? (
          <a className="whatsapp-splash-cta" href={whatsappLink.url} target="_blank" rel="noreferrer">
            <FaWhatsapp size={18} /> Join WhatsApp Channel
          </a>
        ) : null}
        {supportedSocialLinks.length ? (
          <div className="splash-social-links">
            {supportedSocialLinks.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label}>
                <link.Icon size={14} />
              </a>
            ))}
          </div>
        ) : null}
        <div className="loader">
          <span />
          <span />
          <span />
        </div>
      </motion.div>
    </section>
  )
}

export default SplashPage
