import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  Layers,
  Palette,
  GraduationCap,
  IndianRupee,
} from "lucide-react"

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
import { NavUser } from "@/components/nav-user"

// Menu items.
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
    title: "Staff Management",
    url: "/staff",
    icon: Users,
  },
  {
    title: "Components",
    url: "/components",
    icon: Palette,
  },
  {
    title: "Fee Settings",
    url: "/fee-settings",
    icon: IndianRupee,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()

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
              {items.map((item) => (
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
              ))}
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
