import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BadgeDollarSign,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  ReceiptText,
  LayoutDashboard,
  Info,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import FairInvestLogo from '../components/FairInvestLogo.jsx'
import LiveChatWidget from '../components/LiveChatWidget.jsx'
import MobilePageBack from '../components/MobilePageBack.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { getSupportedSocialLinks } from '../lib/socialPlatforms.js'
import { requestAppInstall } from '../lib/appInstall.js'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/investment-plans', label: 'Investment Plans', icon: TrendingUp },
  { to: '/investments', label: 'My Investments', icon: BadgeDollarSign },
  { to: '/referral-tree', label: 'Referral Tree', icon: Users },
  { to: '/deposit', label: 'Deposit', icon: ArrowDownToLine },
  { to: '/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/about', label: 'About Us', icon: Info },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function AppLayout() {
  const location = useLocation()
  const { user, logout, notifications, markNotificationRead, socialLinks } = useAppContext()
  const supportedSocialLinks = useMemo(() => getSupportedSocialLinks(socialLinks), [socialLinks])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isMobileMenuOpen])

  const orderedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      ),
    [notifications],
  )
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  )
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="app-shell">
      {/* 1. Desktop Sidebar (hidden on mobile via CSS) */}
      <aside className="sidebar desktop-sidebar">
        <div className="brand-lockup" style={{ padding: '0.65rem 0.5rem' }}>
          <FairInvestLogo size="medium" />
        </div>
        <p className="tagline" style={{ textAlign: 'center', marginTop: '0.4rem' }}>Premium Investment Ecosystem</p>
        <div className="sidebar-balance-card">
          <p className="muted small">Wallet Balance</p>
          <h4>${Number(user.balance || 0).toFixed(2)}</h4>
          <p className="muted small">
            Locked: ${Number(user.lockedBalance || 0).toFixed(2)}
          </p>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {supportedSocialLinks.length ? (
          <div className="sidebar-social-links">
            <p className="muted small">Community</p>
            <div className="sidebar-social-list">
              {supportedSocialLinks.map((link, idx) => (
                <a
                  key={link.id || link.platform || idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="sidebar-social-item"
                  aria-label={link.label}
                  title={link.label}
                >
                  <link.Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        ) : null}
        <button className="logout-btn" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* 2. Mobile Menu Backdrop & Drawer */}
      <div
        className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        <div className="mobile-drawer-head">
          <FairInvestLogo size="medium" />
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mobile-drawer-user">
          <span className="avatar">{initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </strong>
            <span style={{ fontSize: '0.74rem', color: '#9bc268', fontWeight: 600 }}>
              Premium Member
            </span>
          </div>
        </div>

        <div className="mobile-drawer-balance">
          <p className="balance-title">Wallet Balance</p>
          <h4 className="balance-amt">${Number(user.balance || 0).toFixed(2)}</h4>
          <p className="balance-locked">
            Locked Capital: ${Number(user.lockedBalance || 0).toFixed(2)}
          </p>
        </div>

        <nav className="mobile-drawer-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          className="mini-btn install-header-btn"
          type="button"
          style={{ width: '100%', marginTop: '0.85rem', height: '40px', justifyContent: 'center' }}
          onClick={() => {
            setIsMobileMenuOpen(false)
            if (typeof window.horizoneInstallApp === 'function') {
              window.horizoneInstallApp()
            } else {
              requestAppInstall()
            }
          }}
        >
          App Download
        </button>

        {supportedSocialLinks.length ? (
          <div className="sidebar-social-links" style={{ marginTop: '0.85rem' }}>
            <p className="muted small">Official Community</p>
            <div className="sidebar-social-list">
              {supportedSocialLinks.map((link, idx) => (
                <a
                  key={link.id || link.platform || idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="sidebar-social-item"
                  aria-label={link.label}
                  title={link.label}
                >
                  <link.Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <button className="logout-btn" onClick={logout} style={{ marginTop: '1rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* 3. Main Content & Responsive Header */}
      <main className="main-content">
        <header className="topbar glass-card">
          <div className="mobile-header-brand">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <FairInvestLogo size="small" />
          </div>

          <div className="topbar-desktop-user">
            <p className="muted">Welcome back</p>
            <h2>{user.name}</h2>
          </div>

          <div className="top-actions">
            <ThemeToggle compact className="theme-toggle-inline" />
            <button
              className="mini-btn install-header-btn"
              type="button"
              onClick={() => {
                if (typeof window.horizoneInstallApp === 'function') {
                  window.horizoneInstallApp()
                } else {
                  requestAppInstall()
                }
              }}
            >
              App Download
            </button>
            <button className="icon-btn notify-btn" onClick={() => setIsNotificationsOpen((prev) => !prev)}>
              <Bell size={16} />
              {unreadCount ? <span className="notify-badge">{unreadCount}</span> : null}
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Open support chat"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageSquare size={16} />
            </button>
            <div
              className="avatar-wrap"
              onClick={() => setIsMobileMenuOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="User profile and menu"
              style={{ cursor: 'pointer' }}
            >
              <span className="avatar">{initials}</span>
              <div>
                <strong>{user.name}</strong>
                <p className="muted small">Premium Member</p>
              </div>
            </div>
          </div>
        </header>

        <MobilePageBack />
        <div className="page-outlet" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      {isNotificationsOpen ? (
        <aside className="notify-panel glass-card">
          <div className="notify-head">
            <h4>Notifications</h4>
            <button className="mini-btn" onClick={() => setIsNotificationsOpen(false)}>
              Close
            </button>
          </div>
          <div className="notify-list">
            {orderedNotifications.slice(0, 20).map((item) => (
              <article key={item.id} className={`notify-item ${item.isRead ? '' : 'unread'}`}>
                <h5>{item.title}</h5>
                <p>{item.message}</p>
                <div className="row space-between">
                  <span className="muted small">{String(item.createdAt || '').slice(0, 19).replace('T', ' ')}</span>
                  {!item.isRead ? (
                    <button className="mini-btn" onClick={() => markNotificationRead(item.id)}>
                      Mark read
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {!orderedNotifications.length ? <p className="muted small">No notifications yet.</p> : null}
          </div>
        </aside>
      ) : null}
      <LiveChatWidget isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
      {!isChatOpen ? (
        <button
          type="button"
          className="chat-fab"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open live support chat"
        >
          <MessageCircle size={22} />
        </button>
      ) : null}
    </div>
  )
}

export default AppLayout
