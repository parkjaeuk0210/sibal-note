import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { I18nProvider } from './contexts/I18nContext'
import { AuthProvider } from './contexts/AuthContext'
import { SyncProvider } from './contexts/SyncContext'
import { StoreProvider } from './contexts/StoreProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <AuthProvider>
        <SyncProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </SyncProvider>
      </AuthProvider>
    </I18nProvider>
  </React.StrictMode>,
)