import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { MessagingProvider } from './context/MessagingContext.jsx'
import NotificationToast from './components/NotificationToast.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <MessagingProvider>
          <App />
          <NotificationToast />
        </MessagingProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
