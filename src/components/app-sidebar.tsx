import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  Calendar,
  Palette,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    url: "/students",
    icon: Users,
  },
  {
    title: "Classes",
    url: "/classes",
    icon: BookOpen,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Calendar,
  },
  {
    title: "Components",
    url: "/components",
    icon: Palette,
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
      <SidebarHeader className="h-[73px] flex-row items-center justify-between px-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary transition-all group-data-[collapsible=icon]:hidden">
          <BookOpen className="h-6 w-6" />
          <span>Academy OS</span>
        </div>
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" />
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
                    isActive={location.pathname === item.url}
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
    </Sidebar>
  )
}
