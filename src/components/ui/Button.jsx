import React from 'react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #059669, #0d9488, #10b981)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
        }
      case 'secondary':
        return {
          background: 'rgba(30, 41, 59, 0.8)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }
      case 'outline':
        return {
          background: 'transparent',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.4)',
        }
      case 'ghost':
        return {
          background: 'transparent',
          color: '#94a3b8',
          border: 'none',
        }
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #e11d48, #be123c)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
        }
      default:
        return {
          background: 'linear-gradient(135deg, #059669, #0d9488, #10b981)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { height: '36px', padding: '0 12px', fontSize: '0.8rem' }
      case 'lg':
        return { height: '50px', padding: '0 24px', fontSize: '1rem' }
      default:
        return { height: '44px', padding: '0 18px', fontSize: '0.9rem' }
    }
  }

  const vStyle = getVariantStyles()
  const sStyle = getSizeStyles()

  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        borderRadius: '12px',
        cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        ...vStyle,
        ...sStyle,
      }}
      {...props}
    >
      {isLoading ? (
        <svg
          style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={18} style={{ flexShrink: 0 }} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={18} style={{ flexShrink: 0 }} />}
        </>
      )}
    </button>
  )
}
