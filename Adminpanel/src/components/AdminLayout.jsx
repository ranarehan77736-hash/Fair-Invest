import {
  BarChart3,
  CreditCard,
  Layers3,
  LayoutDashboard,
  Link2,
  LogOut,
  Landmark,
  MessageSquare,
  Moon,
  Receipt,
  Sun,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAdmin } from '../state/AdminContext.jsx'
import { useTheme } from '../state/ThemeContext.jsx'
import FairInvestLogo from './FairInvestLogo.jsx'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/plans', label: 'Plans', icon: Layers3 },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/deposits', label: 'Deposits', icon: CreditCard },
  { to: '/withdrawals', label: 'Withdrawals', icon: BarChart3 },
  { to: '/payment-accounts', label: 'Payment Accounts', icon: Landmark },
  { to: '/chat-rooms', label: 'Support Chat', icon: MessageSquare },
  { to: '/social-links', label: 'Social Links', icon: Link2 },
]

function AdminLayout() {
  const { admin, logout, deposits, withdrawals, chatRooms, users } = useAdmin()
  const { theme, toggleTheme } = useTheme()
  const sidebarStats = useMemo(() => {
    const now = Date.now()
    return {
      pendingDeposits: deposits.filter((item) => String(item.status || '').toLowerCase() === 'pending').length,
      pendingWithdrawals: withdrawals.filter((item) => String(item.status || '').toLowerCase() === 'pending').length,
      unreadChats: chatRooms.filter((item) => Number(item.unreadCount || 0) > 0).length,
      openChats: chatRooms.filter((item) => String(item.status || '').toLowerCase() === 'open').length,
      newUsers: users.filter((item) => now - new Date(item.createdAt || 0).getTime() <= 24 * 60 * 60 * 1000).length,
    }
  }, [deposits, withdrawals, chatRooms, users])
  const navBadges = useMemo(
    () => ({
      '/users': sidebarStats.newUsers,
      '/deposits': sidebarStats.pendingDeposits,
      '/withdrawals': sidebarStats.pendingWithdrawals,
      '/chat-rooms': sidebarStats.unreadChats,
    }),
    [sidebarStats],
  )

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand admin-brand-panel">
          <div className="admin-brand-logo-wrap">
            <FairInvestLogo size="medium" />
          </div>
          <div className="admin-profile">
            <span className="admin-avatar">{String(admin?.name || 'A').charAt(0).toUpperCase()}</span>
            <div className="admin-profile-info">
              <h1>Admin Panel</h1>
              <p>{admin?.name || 'Administrator'}</p>
            </div>
          </div>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} />
              {item.label}
              {navBadges[item.to] ? <span className="admin-nav-badge">{navBadges[item.to]}</span> : null}
            </NavLink>
          ))}
        </nav>
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        </button>
        <button className="danger-btn" onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
