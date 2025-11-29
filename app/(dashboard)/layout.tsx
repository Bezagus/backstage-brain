'use client'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950">
        <div className="p-4 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex items-center gap-4 shadow-sm">
            <SidebarTrigger />
            <h1 className="font-semibold text-lg text-slate-800">Dashboard</h1>
        </div>
        <div className="flex-1 overflow-auto p-6">
            {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
