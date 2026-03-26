"use client"

import { LayoutDashboard, Palette, ImageIcon, Type, Video, LogOut, MessageSquare, Compass, House } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Home Decoration", url: "/admin/home-decoration", icon: Palette },
  { title: "Example Photos", url: "/admin/example-photos", icon: ImageIcon },
  { title: "Color Palettes", url: "/admin/color-palettes", icon: Palette },
  { title: "Select Style", url: "/admin/select-style", icon: Palette },
  { title: "Custom Prompts", url: "/admin/custom-prompts", icon: MessageSquare },
  { title: "Explore", url: "/admin/explore", icon: Compass },
  { title: "Room Types", url: "/admin/room-types", icon: House },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold tracking-tight text-primary">Admin Panel</h1>
          </div>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={isActive} tooltip={item.title} render={<Link href={item.url} />}>
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Logout">
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
