import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  isPassword = false,
  className = '',
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  ...props
}) {
  let isDark = true
  try {
    const themeCtx = useTheme()
    if (themeCtx && themeCtx.theme) {
      isDark = themeCtx.theme === 'dark'
    }
  } catch {
    isDark = true
  }

  const [showPassword, setShowPassword] = useState(false)
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`fi-input-group ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? '#94a3b8' : '#475569',
            display: 'block',
            transition: 'color 0.25s ease',
          }}
        >
          {label} {required && <span style={{ color: '#f43f5e' }}>*</span>}
        </label>
      )}

      <div
        className={`input-wrap ${error ? 'border-rose-500' : ''}`}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '48px',
          borderRadius: '14px',
          background: isDark ? 'rgba(20, 28, 20, 0.85)' : 'rgba(241, 245, 249, 0.85)',
          border: error
            ? '1px solid rgba(244, 63, 94, 0.6)'
            : isDark
              ? '1px solid rgba(132, 169, 90, 0.25)'
              : '1px solid rgba(226, 232, 240, 0.9)',
          padding: '0 14px',
          color: isDark ? '#f8fafc' : '#0f172a',
          boxSizing: 'border-box',
          transition: 'all 0.25s ease',
          boxShadow: isDark ? 'none' : 'inset 0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        {Icon && (
          <div style={{ marginRight: '10px', color: isDark ? '#84a95a' : '#64748b', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Icon size={18} />
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: isDark ? '#ffffff' : '#0f172a',
            fontSize: '0.92rem',
            fontWeight: 500,
            boxSizing: 'border-box',
            paddingRight: isPassword ? '32px' : '0',
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowPassword(!showPassword)
            }}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              color: showPassword ? (isDark ? '#9bc268' : '#5e7e37') : (isDark ? '#9ca899' : '#64748b'),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              zIndex: 5,
              transition: 'color 0.2s ease',
            }}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <span style={{ fontSize: '0.78rem', color: '#f43f5e', fontWeight: 600 }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>{helperText}</span>
      ) : null}
    </div>
  )
}
