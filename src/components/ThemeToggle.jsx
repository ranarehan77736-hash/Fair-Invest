import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

function ThemeToggle({ compact = false, className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      className={`theme-toggle ${compact ? 'theme-toggle-compact' : ''} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 99999,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: compact ? '8px' : '8px 16px',
        borderRadius: '999px',
        background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(16, 185, 129, 0.3)',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontSize: '0.82rem',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: isDark
          ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.15)'
          : '0 8px 25px rgba(15, 23, 42, 0.1), 0 0 15px rgba(16, 185, 129, 0.12)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
      }}
    >
      {isDark ? (
        <Sun size={16} style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))' }} />
      ) : (
        <Moon size={16} style={{ color: '#0d9488', filter: 'drop-shadow(0 0 4px rgba(13, 148, 136, 0.4))' }} />
      )}
      {!compact ? <span>{isDark ? 'Light' : 'Dark'}</span> : null}
    </button>
  )
}

export default ThemeToggle
