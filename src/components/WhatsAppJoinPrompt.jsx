import { useEffect, useMemo, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa6'
import { X, Sparkles } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { getSupportedSocialLinks } from '../lib/socialPlatforms.js'
import FairInvestLogo from './FairInvestLogo.jsx'

const DEFAULT_WHATSAPP_URL = 'https://chat.whatsapp.com/'

function WhatsAppJoinPrompt() {
  const { isBootstrapping, socialLinks } = useAppContext()
  const [isOpen, setIsOpen] = useState(false)

  const whatsappLink = useMemo(() => {
    const links = getSupportedSocialLinks(socialLinks)
    const found = links.find((item) => item.platform === 'whatsapp' && item.url)
    return found || { platform: 'whatsapp', url: DEFAULT_WHATSAPP_URL, label: 'WhatsApp' }
  }, [socialLinks])

  useEffect(() => {
    if (isBootstrapping) return
    setIsOpen(true)
  }, [isBootstrapping])

  useEffect(() => {
    if (!isOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const closePrompt = () => setIsOpen(false)

  if (!isOpen || !whatsappLink?.url) return null

  return (
    <div className="whatsapp-prompt-overlay" role="dialog" aria-modal="true" aria-labelledby="whatsapp-prompt-title">
      <div className="whatsapp-prompt-card">
        <button type="button" className="whatsapp-prompt-close" onClick={closePrompt} aria-label="Close">
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="whatsapp-prompt-logo-wrap">
          <FairInvestLogo size="large" forceDark={true} />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            background: 'rgba(132, 169, 90, 0.18)',
            border: '1px solid rgba(132, 169, 90, 0.38)',
            color: '#9bc268',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(132, 169, 90, 0.15)',
          }}
        >
          <Sparkles size={13} /> VIP Investor Community
        </div>

        <h2 id="whatsapp-prompt-title" className="whatsapp-prompt-title">
          Welcome to FairInvest
        </h2>
        <p className="whatsapp-prompt-subtitle">
          Join our official channel for real-time payout verifications, market analytics, and 24/7 dedicated support.
        </p>

        <a
          className="whatsapp-prompt-cta"
          href={whatsappLink.url}
          target="_blank"
          rel="noreferrer"
          onClick={closePrompt}
        >
          <FaWhatsapp size={20} aria-hidden />
          Join Official WhatsApp
        </a>
      </div>
    </div>
  )
}

export default WhatsAppJoinPrompt
