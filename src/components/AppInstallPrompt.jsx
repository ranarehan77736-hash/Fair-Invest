import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Smartphone, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import {
  APP_INSTALL_REQUEST_EVENT,
  downloadApk,
  getApkDownloadUrl,
  getInstallInstructions,
  isAppInstalled,
} from '../lib/appInstall.js'

function AppInstallPrompt() {
  let isDark = true
  try {
    const themeCtx = useTheme()
    if (themeCtx && themeCtx.theme) {
      isDark = themeCtx.theme === 'dark'
    }
  } catch {
    isDark = true
  }

  const deferredPromptRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalled, setIsInstalled] = useState(isAppInstalled)
  const [canNativeInstall, setCanNativeInstall] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const apkDownloadUrl = getApkDownloadUrl()
  const instructions = getInstallInstructions()

  const storageKey = 'fairinvest-install-dismissed-at'

  const runInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current
    if (prompt) {
      try {
        await prompt.prompt()
        const choice = await prompt.userChoice
        if (choice.outcome === 'accepted') {
          deferredPromptRef.current = null
          setCanNativeInstall(false)
          setIsInstalled(true)
        }
        setIsOpen(false)
        return
      } catch {
        deferredPromptRef.current = null
        setCanNativeInstall(false)
      }
    }

    downloadApk(apkDownloadUrl)
    setShowInstructions(true)
    setIsOpen(true)
  }, [apkDownloadUrl])

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(storageKey) || 0)
    const recentlyDismissed = Date.now() - dismissedAt < 12 * 60 * 60 * 1000
    if (!recentlyDismissed && !isAppInstalled()) setIsOpen(true)

    const onBeforeInstall = (event) => {
      event.preventDefault()
      deferredPromptRef.current = event
      setCanNativeInstall(true)
      setIsOpen(true)
    }

    const onInstalled = () => {
      setIsInstalled(true)
      setIsOpen(false)
      setShowInstructions(false)
      deferredPromptRef.current = null
      setCanNativeInstall(false)
    }

    const onInstallRequest = () => {
      runInstall()
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener(APP_INSTALL_REQUEST_EVENT, onInstallRequest)
    window.horizoneInstallApp = runInstall
    window.fairinvestInstallApp = runInstall

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener(APP_INSTALL_REQUEST_EVENT, onInstallRequest)
      if (window.horizoneInstallApp === runInstall) delete window.horizoneInstallApp
      if (window.fairinvestInstallApp === runInstall) delete window.fairinvestInstallApp
    }
  }, [runInstall])

  const closePrompt = () => {
    localStorage.setItem(storageKey, String(Date.now()))
    setIsOpen(false)
    setShowInstructions(false)
  }

  if (isInstalled || !isOpen) return null

  const actionLabel = canNativeInstall ? 'Install App' : 'Download App'

  return (
    <div
      className="install-prompt-card glass-card"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        width: 'min(380px, calc(100vw - 2rem))',
        padding: '1.25rem',
        borderRadius: '24px',
        background: isDark
          ? 'rgba(18, 24, 18, 0.95)'
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 248, 241, 0.94) 100%)',
        backdropFilter: 'blur(28px)',
        border: isDark
          ? '1px solid rgba(132, 169, 90, 0.35)'
          : '1px solid rgba(122, 159, 76, 0.28)',
        boxShadow: isDark
          ? '0 20px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(132, 169, 90, 0.22)'
          : '0 20px 40px rgba(94, 126, 55, 0.15)',
        color: isDark ? '#f0f4ef' : '#141e14',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
      }}
    >
      <button
        type="button"
        onClick={closePrompt}
        aria-label="Close install prompt"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
          border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.25)',
          color: isDark ? '#9ca899' : '#526352',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isDark ? 'none' : '0 2px 5px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
        }}
      >
        <X size={14} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingRight: '24px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: isDark
              ? 'linear-gradient(135deg, #7a9f4c 0%, #5e7e37 100%)'
              : 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: isDark
              ? '0 4px 14px rgba(122, 159, 76, 0.4)'
              : '0 4px 12px rgba(94, 126, 55, 0.25)',
          }}
        >
          <Smartphone size={22} />
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '0.98rem', fontWeight: 800, color: isDark ? '#f0f4ef' : '#141e14', lineHeight: 1.25 }}>
            {showInstructions ? instructions.title : 'Install FairInvest App'}
          </strong>
          <p style={{ fontSize: '0.78rem', color: isDark ? '#9ca899' : '#526352', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            {showInstructions
              ? 'Follow these steps if install did not start automatically.'
              : 'Faster access, full-screen experience, and instant updates.'}
          </p>
        </div>
      </div>

      {showInstructions ? (
        <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {instructions.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
        <button
          type="button"
          onClick={closePrompt}
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '10px',
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(244, 248, 241, 0.9)',
            border: isDark ? '1px solid rgba(132, 169, 90, 0.25)' : '1px solid rgba(122, 159, 76, 0.25)',
            color: isDark ? '#9ca899' : '#526352',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Not now
        </button>
        <button
          type="button"
          onClick={runInstall}
          style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '10px',
            background: isDark
              ? 'linear-gradient(135deg, #7a9f4c 0%, #5e7e37 50%, #84a95a 100%)'
              : 'linear-gradient(135deg, #5e7e37 0%, #7a9f4c 50%, #4d6928 100%)',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: isDark
              ? '0 4px 14px rgba(122, 159, 76, 0.45)'
              : '0 4px 14px rgba(94, 126, 55, 0.3)',
          }}
        >
          <Download size={14} /> {actionLabel}
        </button>
      </div>
    </div>
  )
}

export default AppInstallPrompt
