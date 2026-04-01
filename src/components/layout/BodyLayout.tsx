import React, { useEffect } from "react"
import { useBreadcrumbs } from "@/context/BreadcrumbContext"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BodyLayoutProps {
  breadcrumbs: BreadcrumbItem[]
  children: React.ReactNode
  toolbar?: React.ReactNode
  actions?: React.ReactNode
}

const BodyLayout: React.FC<BodyLayoutProps> = ({
  breadcrumbs,
  children,
  toolbar,
  actions,
}) => {
  const { setBreadcrumbs } = useBreadcrumbs()

  // Push breadcrumbs to the header via context
  useEffect(() => {
    setBreadcrumbs(breadcrumbs)
    return () => setBreadcrumbs([])
  }, [breadcrumbs, setBreadcrumbs])

  const hasToolbar = toolbar || actions

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Page Toolbar — compact row (only renders if toolbar or actions exist) */}
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[64px] px-4 sm:px-6 py-4 sm:py-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          {toolbar && (
            <div className="flex items-center w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-none snap-x">
              {toolbar}
            </div>
          )}
          {actions && (
            <div className="flex items-center w-full sm:w-auto sm:ml-auto shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 px-4 py-4 sm:px-6 sm:py-6 overflow-auto">
        {children}
      </div>
    </div>
  )
}

export default BodyLayout
