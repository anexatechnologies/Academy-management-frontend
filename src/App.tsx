import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ComponentsPage from "@/pages/components-page"
import Dashboard from "@/pages/dashboard"

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50 flex flex-col h-screen">
            <header className="flex h-[73px] items-center gap-4 border-b px-6 bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                 Academy Management 
              </h2>
            </header>
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/components" element={<ComponentsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App
