import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import { AdminProvider } from './state/AdminContext.jsx'
import { ThemeProvider } from './state/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/admin">
      <ThemeProvider>
        <AdminProvider>
          <App />
          <Toaster richColors position="top-right" />
        </AdminProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
