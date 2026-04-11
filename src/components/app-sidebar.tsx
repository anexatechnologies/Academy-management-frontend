import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  Layers,
  GraduationCap,
  Shield,
  FileText,
  Award,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Megaphone,
  IndianRupee,
  Plus,
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
    title: "Enquiry Management",
    url: "/enquiries",
    icon: ClipboardList,
  },
  {
    title: "Student Management",
    url: "/students",
    icon: GraduationCap,
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
    title: "Announcements",
    url: "/announcements",
    icon: Megaphone,
  },
  {
    title: "Roles & Permissions",
    url: "/roles",
    icon: Shield,
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
  },
]

// Settings sub-menu items
const settingsItems = [
  {
    title: "Application Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Attendance Settings",
    url: "/settings/attendance",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()

  const isUnderSettings = location.pathname.startsWith("/settings")
  const isUnderStudents = location.pathname.startsWith("/students")
  const [settingsOpen, setSettingsOpen] = useState(isUnderSettings)
  const [studentsOpen, setStudentsOpen] = useState(isUnderStudents)

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-[73px] flex-row items-center justify-between px-4 border-b group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 font-bold text-lg text-primary transition-all group-data-[collapsible=icon]:hidden">
          <img
            src="/academy-logo.jpeg"
            height={60}
            width={30}
            alt="logo"
          />
          <span>Pawan Academy</span>
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
                  "/announcements": "announcements",
                  "/enquiries": "enquiries",
                  "/configure": "configure",
                  "/roles": "roles",
                }
                const moduleName = moduleMap[item.url]
                if (moduleName && !hasPermission(moduleName, "read")) {
                  return null
                }

                if (moduleName === "students") {
                  if (!hasPermission("students", "read")) return null
                  return (
                    <Collapsible
                      key={item.title}
                      open={studentsOpen}
                      onOpenChange={setStudentsOpen}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem className="group/item relative">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isUnderStudents}
                            className={`w-full cursor-pointer ${hasPermission("students", "create") ? "pr-12" : "pr-8"}`}
                            onClick={() => navigate("/students")}
                          >
                            <item.icon />
                            <span className="flex-1 truncate text-left">{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        {hasPermission("students", "create") && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity z-10 group-data-[collapsible=icon]:hidden">
                            <Link
                              to="/students/new"
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-primary hover:text-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-primary"
                              title="Add Student"
                            >
                              <Plus className="h-4 w-4" />
                            </Link>
                          </div>
                        )}

                        <CollapsibleContent className="transition-all duration-200 group-data-[collapsible=icon]:hidden">
                          <div className="relative ml-[22px] mt-0.5 mb-1">
                            <span className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                            <Link
                              to="/students"
                              className={`relative flex items-center gap-2 py-1.5 pl-5 pr-2 text-sm rounded-md transition-colors
                                ${location.pathname === "/students"
                                  ? "text-primary font-semibold"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                }`}
                            >
                              <span className={`absolute left-[-4.5px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full border-2 transition-all
                                ${location.pathname === "/students"
                                  ? "bg-primary border-primary scale-110"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                }`}
                              />
                              <span>Student List</span>
                            </Link>
                            {hasPermission("payments", "read") && (
                              <Link
                                to="/students/pending-payments"
                                className={`relative flex items-center gap-2 py-1.5 pl-5 pr-2 text-sm rounded-md transition-colors
                                  ${location.pathname === "/students/pending-payments"
                                    ? "text-primary font-semibold"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                  }`}
                              >
                                <span className={`absolute left-[-4.5px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full border-2 transition-all
                                  ${location.pathname === "/students/pending-payments"
                                    ? "bg-primary border-primary scale-110"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                  }`}
                                />
                                <IndianRupee className="h-3.5 w-3.5" />
                                <span>Pending Payments</span>
                              </Link>
                            )}
                          </div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
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
                            onClick={() => navigate("/attendance/students")}
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

                const hasCreateEndpoint = ["users", "courses", "batches", "enquiries", "staff"].includes(moduleName)
                const canCreate = hasCreateEndpoint && hasPermission(moduleName as any, "create")

                return (
                  <SidebarMenuItem key={item.title} className="group/item relative">
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url)}
                      className={canCreate ? "pr-10" : ""}
                    >
                      <Link to={item.url} className="flex w-full items-center gap-2">
                        <item.icon />
                        <span className="flex-1 truncate text-left">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {canCreate && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity z-10 group-data-[collapsible=icon]:hidden">
                        <Link
                          to={`${item.url}/new`}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-primary hover:text-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-primary"
                          title={`Add ${item.title.split(' ')[0]}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </SidebarMenuItem>
                )
              })}

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
                        onClick={() => navigate("/settings")}
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
                          "/settings/attendance": "settings",
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
