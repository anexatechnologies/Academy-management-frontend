import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/sonner"
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <App />
          <Toaster richColors closeButton position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
