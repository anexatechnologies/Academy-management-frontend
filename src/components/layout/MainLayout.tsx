import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router-dom"

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 flex flex-col h-screen">
          <header className="flex h-[73px] items-center gap-4 border-b px-4 md:px-6 bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
            <SidebarTrigger className="md:hidden" />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 md:hidden" />
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
               Academy Management 
            </h2>
          </header>
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout
