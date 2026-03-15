import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  Layers,
  GraduationCap,
  Building,
  Shield,
  FileText,
  Award,
  CalendarCheck,
  IndianRupee,
  ChevronRight,
  ClipboardList,
} from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { NavUser } from "@/components/nav-user"

// Menu items (flat).
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
  },
  {
    title: "Course Management",
    url: "/courses",
    icon: BookOpen,
  },
  {
    title: "Batch Management",
    url: "/batches",
    icon: Layers,
  },
  {
    title: "Student Management",
    url: "/students",
    icon: GraduationCap,
  },
  {
    title: "Enquiry Management",
    url: "/enquiries",
    icon: ClipboardList,
  },
  {
    title: "Staff Management",
    url: "/staff",
    icon: Users,
  },
  {
    title: "Certification",
    url: "/certificates",
    icon: Award,
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Configure",
    url: "/configure",
    icon: Building,
  },
  {
    title: "Roles & Permissions",
    url: "/roles",
    icon: Shield,
  },
]

// Settings sub-menu items
const settingsItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Fee Settings",
    url: "/settings/fees",
    icon: IndianRupee,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { hasPermission } = usePermissions()

  const isUnderSettings = location.pathname.startsWith("/settings")
  const [settingsOpen, setSettingsOpen] = useState(isUnderSettings)

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-[73px] flex-row items-center justify-between px-4 border-b group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 font-bold text-xl text-primary transition-all group-data-[collapsible=icon]:hidden">
          <BookOpen className="h-6 w-6" />
          <span>Academy OS</span>
        </div>
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors shrink-0" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Determine module name from URL or add it to items array
                const moduleMap: Record<string, string> = {
                  "/": "dashboard",
                  "/users": "users",
                  "/courses": "courses",
                  "/batches": "batches",
                  "/students": "students",
                  "/staff": "staff",
                  "/certificates": "certificates",
                  "/attendance": "attendance",
                  "/reports": "reports",
                  "/configure": "configure",
                  "/roles": "roles",
                }
                const moduleName = moduleMap[item.url]
                if (moduleName && !hasPermission(moduleName, "read")) {
                  return null
                }

                if (moduleName === "attendance") {
                  return (
                    <Collapsible
                      key={item.title}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={location.pathname.startsWith("/attendance")}
                            className="w-full cursor-pointer"
                          >
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="transition-all duration-200 group-data-[collapsible=icon]:hidden">
                          <div className="relative ml-[22px] mt-0.5 mb-1">
                            <span className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                            <Link
                              to="/attendance/students"
                              className={`relative flex items-center gap-2 py-1.5 pl-5 pr-2 text-sm rounded-md transition-colors
                                ${location.pathname === "/attendance/students"
                                  ? "text-primary font-semibold"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                }`}
                            >
                              <span className={`absolute left-[-4.5px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full border-2 transition-all
                                ${location.pathname === "/attendance/students"
                                  ? "bg-primary border-primary scale-110"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                }`}
                              />
                              <span>Student Attendance</span>
                            </Link>
                            <Link
                              to="/attendance/staff"
                              className={`relative flex items-center gap-2 py-1.5 pl-5 pr-2 text-sm rounded-md transition-colors
                                ${location.pathname === "/attendance/staff"
                                  ? "text-primary font-semibold"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                }`}
                            >
                              <span className={`absolute left-[-4.5px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full border-2 transition-all
                                ${location.pathname === "/attendance/staff"
                                  ? "bg-primary border-primary scale-110"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                }`}
                              />
                              <span>Staff Attendance</span>
                            </Link>
                          </div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url)}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )})}

              {/* Settings collapsible item */}
              <Collapsible
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  {/* In icon-only mode: click gear icon goes directly to the active settings sub-page */}
                  <CollapsibleTrigger asChild>
                    {hasPermission("settings", "read") || hasPermission("fee-settings", "read") ? (
                      <SidebarMenuButton
                        tooltip="Settings"
                        isActive={isUnderSettings}
                        className="w-full cursor-pointer"
                      >
                        <Settings />
                        <span>Settings</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    ) : null}
                  </CollapsibleTrigger>
                  {/* Sub-menu hidden entirely when sidebar is icon-only collapsed */}
                  <CollapsibleContent className="transition-all duration-200 group-data-[collapsible=icon]:hidden">
                    {/* Custom tree sub-menu: single continuous vertical line on left */}
                    <div className="relative ml-[22px] mt-0.5 mb-1">
                      {/* The continuous vertical guide line */}
                      <span className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                      {settingsItems.map((sub) => {
                        // Exact match only — prevents parent routes matching child routes
                        const isActive = location.pathname === sub.url
                        
                        // Check permission for sub-items
                        const subModuleMap: Record<string, string> = {
                          "/settings": "settings",
                          "/settings/fees": "fee-settings",
                        }
                        const subModuleName = subModuleMap[sub.url]
                        if (subModuleName && !hasPermission(subModuleName, "read")) {
                          return null
                        }

                        return (
                          <Link
                            key={sub.title}
                            to={sub.url}
                            className={`relative flex items-center gap-2 py-1.5 pl-5 pr-2 text-sm rounded-md transition-colors
                              ${isActive
                                ? "text-primary font-semibold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                              }`}
                          >
                            {/* Dot — only visible when active, sits on the vertical line */}
                            <span className={`absolute left-[-4.5px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full border-2 transition-all
                              ${isActive
                                ? "bg-primary border-primary scale-110"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                              }`}
                            />
                            <span>{sub.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
