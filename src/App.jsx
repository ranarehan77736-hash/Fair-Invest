import { Suspense, lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import { Toaster } from 'sonner'
import { useAppContext } from './context/AppContext.jsx'
import { useTheme } from './context/ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import WhatsAppJoinPrompt from './components/WhatsAppJoinPrompt.jsx'
import AppInstallPrompt from './components/AppInstallPrompt.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

const SplashPage = lazy(() => import('./pages/SplashPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const SignUpPage = lazy(() => import('./pages/SignUpPage.jsx'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'))
const InvestmentPlansPage = lazy(() => import('./pages/InvestmentPlansPage.jsx'))
const InvestmentsPage = lazy(() => import('./pages/InvestmentsPage.jsx'))
const DepositPage = lazy(() => import('./pages/DepositPage.jsx'))
const WithdrawPage = lazy(() => import('./pages/WithdrawPage.jsx'))
const TransactionsPage = lazy(() => import('./pages/TransactionsPage.jsx'))
const ReferralTreePage = lazy(() => import('./pages/ReferralTreePage.jsx'))
const ReferralEarningsPage = lazy(() => import('./pages/ReferralEarningsPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))

function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAppContext()
  if (isBootstrapping) return <div className="route-loader">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function PublicRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAppContext()
  if (isBootstrapping) return <div className="route-loader">Loading...</div>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  const { theme } = useTheme()
  const { isAuthenticated } = useAppContext()

  return (
    <>
      {!isAuthenticated ? <ThemeToggle /> : null}
      <Suspense fallback={<div className="route-loader">Loading...</div>}>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/investment-plans" element={<InvestmentPlansPage />} />
              <Route path="/investments" element={<InvestmentsPage />} />
              <Route path="/deposit" element={<DepositPage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/referral-tree" element={<ReferralTreePage />} />
              <Route path="/referrals/tree" element={<Navigate to="/referral-tree" replace />} />
              <Route path="/referral-earnings" element={<ReferralEarningsPage />} />
              <Route
                path="/referrals/earnings"
                element={<Navigate to="/referral-earnings" replace />}
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <WhatsAppJoinPrompt />
      <AppInstallPrompt />
      <Toaster theme={theme} position="top-right" richColors />
    </>
  )
}

export default App
