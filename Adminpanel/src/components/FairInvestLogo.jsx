import React from 'react'
import { useTheme } from '../state/ThemeContext.jsx'

export default function FairInvestLogo({
  className = '',
  showText = true,
  size = 'medium',
  forceDark = false,
  variant = 'combined', // 'combined' | 'emblem' | 'full'
}) {
  let isDark = true
  try {
    const themeCtx = useTheme()
    if (themeCtx && themeCtx.theme) {
      isDark = forceDark || themeCtx.theme === 'dark'
    }
  } catch {
    isDark = true
  }

  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-mark.png`
  const logoFullSrc = `${import.meta.env.BASE_URL}logo.png`
  const [cleanedMarkSrc, setCleanedMarkSrc] = React.useState(null)

  React.useEffect(() => {
    let isMounted = true
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = logoMarkSrc
    img.onload = () => {
      try {
        const cvs = document.createElement('canvas')
        cvs.width = img.naturalWidth
        cvs.height = img.naturalHeight
        const ctx = cvs.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height)
        const d = imgData.data
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2]
          if (r < 55 && g < 65 && b < 85) {
            d[i + 3] = 0
          } else if (r < 85 && g < 95 && b < 115) {
            const maxVal = Math.max(r, g, b)
            const alphaFactor = Math.min(1, Math.max(0, (maxVal - 45) / 40))
            d[i + 3] = Math.floor(d[i + 3] * alphaFactor)
          }
        }
        ctx.putImageData(imgData, 0, 0)
        if (isMounted) {
          setCleanedMarkSrc(cvs.toDataURL())
        }
      } catch {
        // fallback
      }
    }
    return () => {
      isMounted = false
    }
  }, [logoMarkSrc])

  const activeMarkSrc = cleanedMarkSrc || logoMarkSrc

  const sizeMap = {
    small: { height: 32, markWidth: 38, markHeight: 30, fontSize: '0.96rem', dotSize: '0.6rem' },
    medium: { height: 40, markWidth: 46, markHeight: 34, fontSize: '1.1rem', dotSize: '0.64rem' },
    large: { height: 68, markWidth: 74, markHeight: 54, fontSize: '1.6rem', dotSize: '0.8rem' },
    xlarge: { height: 120, markWidth: 130, markHeight: 90, fontSize: '2.2rem', dotSize: '0.95rem' },
  }

  const currentSize = sizeMap[size] || sizeMap.medium

  if (variant === 'full') {
    return (
      <div
        className={`fairinvest-logo-full-wrap ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          maxWidth: '100%',
        }}
      >
        <img
          src={logoFullSrc}
          alt="FAIR INVEST Logo"
          style={{
            height: `${currentSize.height}px`,
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            borderRadius: '14px',
            filter: isDark
              ? 'drop-shadow(0 6px 20px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 12px rgba(122, 159, 76, 0.25))'
              : 'drop-shadow(0 6px 16px rgba(94, 126, 55, 0.2))',
            transition: 'all 0.3s ease',
          }}
        />
      </div>
    )
  }

  if (variant === 'emblem') {
    return (
      <div
        className={`fairinvest-logo-emblem-wrap ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '100%',
        }}
      >
        <img
          src={activeMarkSrc}
          alt="FAIR INVEST 3D Mark"
          style={{
            height: `${currentSize.height}px`,
            width: 'auto',
            objectFit: 'contain',
            filter: isDark
              ? 'drop-shadow(0 4px 14px rgba(122, 159, 76, 0.4)) drop-shadow(0 2px 6px rgba(0,0,0,0.5))'
              : 'drop-shadow(0 4px 10px rgba(94, 126, 55, 0.25))',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={`fairinvest-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        userSelect: 'none',
        cursor: 'pointer',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        className="fairinvest-logo-mark-wrap"
        style={{
          height: `${currentSize.markHeight}px`,
          width: `${currentSize.markWidth}px`,
          minWidth: `${currentSize.markWidth}px`,
          minHeight: `${currentSize.markHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          flexShrink: 0,
        }}
      >
        <img
          src={activeMarkSrc}
          alt="FAIR INVEST 3D Mark"
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'contain',
            mixBlendMode: isDark ? 'screen' : 'normal',
            filter: isDark ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(122,159,76,0.3))' : 'drop-shadow(0 2px 6px rgba(94,126,55,0.2))',
          }}
        />
      </div>

      {showText && (
        <span
          className="fairinvest-logo-text"
          style={{
            fontSize: currentSize.fontSize,
            fontWeight: 850,
            display: 'inline-flex',
            alignItems: 'center',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            flexShrink: 1,
          }}
        >
          <span
            style={{
              color: isDark ? '#ffffff' : '#141e14',
              transition: 'color 0.25s ease',
              textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            FAIR
          </span>
          <span
            style={{
              background: 'linear-gradient(135deg, #7a9f4c 0%, #5e7e37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginLeft: '3px',
              fontWeight: 900,
            }}
          >
            INVEST
          </span>
          <span
            style={{
              fontSize: currentSize.dotSize,
              fontWeight: 700,
              padding: '1px 5px',
              marginLeft: '4px',
              borderRadius: '5px',
              background: isDark ? 'rgba(122, 159, 76, 0.18)' : 'rgba(94, 126, 55, 0.12)',
              color: isDark ? '#a3c973' : '#5e7e37',
              border: isDark ? '1px solid rgba(122, 159, 76, 0.35)' : '1px solid rgba(94, 126, 55, 0.25)',
              transition: 'all 0.25s ease',
              flexShrink: 0,
            }}
          >
            .com
          </span>
        </span>
      )}
    </div>
  )
}
