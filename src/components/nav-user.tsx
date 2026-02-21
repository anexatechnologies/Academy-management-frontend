import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Settings, Key, ChevronsUpDown } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal"

export function NavUser() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const { auth, logout } = useAuth()
  const { isMobile, state } = useSidebar()
  const navigate = useNavigate()

  if (!auth.user) return null

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const userInitials = auth.user.full_name
    ? auth.user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : auth.user.username[0].toUpperCase()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer",
            state === "collapsed" && "justify-center p-0"
          )}
        >
          <Avatar 
            fallback={userInitials} 
            className="h-8 w-8 rounded-lg"
          />
          <div className={cn("flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden min-w-0")}>
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {auth.user.full_name || auth.user.username}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {auth.user.email}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-2"
        align={isMobile ? "center" : "end"}
        side={isMobile ? "bottom" : "right"}
        sideOffset={state === "collapsed" ? 20 : 8}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">{auth.user.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {auth.user.role.replace("_", " ")}
            </p>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Key className="size-4" />
            Change Password
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Settings className="size-4" />
            Settings
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </PopoverContent>
      <ChangePasswordModal 
        open={isPasswordModalOpen} 
        onOpenChange={setIsPasswordModalOpen} 
      />
    </Popover>
  )
}
