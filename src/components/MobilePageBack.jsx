import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

function MobilePageBack({ label = 'Back to Dashboard' }) {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/dashboard') return null

  return (
    <button type="button" className="mobile-page-back" onClick={() => navigate('/dashboard')}>
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}

export default MobilePageBack
