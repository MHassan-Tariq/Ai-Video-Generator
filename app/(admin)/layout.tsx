import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-background min-h-screen relative">
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <ThemeToggle />
        </div>
        <div className="flex items-center p-4 md:hidden border-b">
          <SidebarTrigger />
          <h1 className="ml-4 font-semibold">Admin Panel</h1>
        </div>
        <div className="p-6 md:p-10 md:pt-16 w-full max-w-7xl mx-auto flex-1">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
