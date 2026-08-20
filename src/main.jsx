import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { AccountProvider } from './data/AccountProvider.jsx'
import { PrototypeProvider } from './data/PrototypeProvider.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AccountProvider>
          <PrototypeProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </PrototypeProvider>
        </AccountProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
