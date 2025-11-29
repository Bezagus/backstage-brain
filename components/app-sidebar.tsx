'use client'

import { Calendar, CalendarPlus, Home, MessageSquare, Upload, Brain, User2, ChevronUp, Settings, LogOut, Loader2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Upload Center",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "Crear Evento",
    url: "/events/new",
    icon: CalendarPlus,
  },
  {
    title: "Chat AI",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Timeline",
    url: "/timeline",
    icon: Calendar,
  },
]

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
      setLoggingOut(false)
    }
  }

  // Get user display name and email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const displayEmail = user?.email || ''

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
         <div className="flex items-center gap-3 px-4 py-3 border-b border-sidebar-border/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <Brain className="h-5 w-5" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-slate-800">Backstage Brain</span>
                <span className="truncate text-xs text-muted-foreground">Event Manager</span>
            </div>
         </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url} className="hover:text-black transition-colors">
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
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <User2 className="h-5 w-5" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{displayName}</span>
                      <span className="truncate text-xs">{displayEmail}</span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
                    {loggingOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    <span>{loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}