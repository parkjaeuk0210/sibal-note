import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { ShareLanding } from './components/Sharing/ShareLanding';
import { I18nProvider } from './contexts/I18nContext';
import { AuthProvider } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import { StoreProvider } from './contexts/StoreProvider';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <SyncProvider>
            <StoreProvider>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/share/:token" element={<ShareLanding />} />
              </Routes>
            </StoreProvider>
          </SyncProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
};