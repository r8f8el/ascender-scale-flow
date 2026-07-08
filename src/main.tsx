
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { QueryProvider } from './providers/QueryProvider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryProvider>
      <AuthProvider>
        <App />
        <Toaster />
        <SonnerToaster />
      </AuthProvider>
    </QueryProvider>
  </ErrorBoundary>
);
