import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import { useAdmin } from './state/AdminContext.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import PlansPage from './pages/PlansPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import DepositsPage from './pages/DepositsPage.jsx'
import WithdrawalsPage from './pages/WithdrawalsPage.jsx'
import PaymentAccountsPage from './pages/PaymentAccountsPage.jsx'
import SocialLinksPage from './pages/SocialLinksPage.jsx'
import ChatRoomsPage from './pages/ChatRoomsPage.jsx'

function ProtectedRoute() {
  // Login temporarily bypassed for direct dashboard access
  return <Outlet />
}

function App() {
  const { isAuthenticated, bootstrap } = useAdmin()

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/deposits" element={<DepositsPage />} />
          <Route path="/deposit" element={<Navigate to="/deposits" replace />} />
          <Route path="/despoit" element={<Navigate to="/deposits" replace />} />
          <Route path="/withdrawals" element={<WithdrawalsPage />} />
          <Route path="/payment-accounts" element={<PaymentAccountsPage />} />
          <Route path="/social-links" element={<SocialLinksPage />} />
          <Route path="/chat-rooms" element={<ChatRoomsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
