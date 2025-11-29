import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Backstage Brain",
  description: "Event Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50/50`}
      >
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
      </body>
    </html>
  );
}