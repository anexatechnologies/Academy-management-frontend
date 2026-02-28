import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet, Link, useNavigate } from "react-router-dom"
import { BreadcrumbProvider, useBreadcrumbs } from "@/context/BreadcrumbContext"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import React from "react"

const HeaderBreadcrumbs = () => {
  const { breadcrumbs } = useBreadcrumbs()
  const navigate = useNavigate()

  if (breadcrumbs.length === 0) return null

  // Find the parent breadcrumb (last one with an href) for the back button
  const parentCrumb = [...breadcrumbs].reverse().find((b) => b.href)
  const showBackButton = parentCrumb !== undefined

  return (
    <>
      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />

      {showBackButton && (
        <button
          onClick={() => navigate(parentCrumb.href!)}
          className="flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
          aria-label="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0" />}
          {item.href ? (
            <Link
              to={item.href}
              className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  )
}

const MainLayout = () => {
  return (
    <TooltipProvider>
      <BreadcrumbProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 flex flex-col h-screen">
              <header className="flex h-[73px] items-center gap-2 border-b px-4 md:px-6 bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
                <SidebarTrigger className="md:hidden" />
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 md:hidden" />
                <div className="flex items-center gap-2 overflow-hidden">
                  <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Academy Management
                  </h2>
                  <HeaderBreadcrumbs />
                </div>
              </header>
              <div className="flex-1 overflow-auto">
                <Outlet />
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BreadcrumbProvider>
    </TooltipProvider>
  )
}

export default MainLayout
