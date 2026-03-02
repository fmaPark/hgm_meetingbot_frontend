"use client"

import type { ReactNode } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"

interface AppLayoutProps {
  children: ReactNode
  userName?: string
  showSettings?: boolean
  showAdmin?: boolean
  onLogout?: () => void
}

export function AppLayout({
  children,
  userName = "박민아",
  showSettings = true,
  showAdmin = true,
  onLogout = () => alert("로그아웃 되었습니다."),
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        userName={userName}
        showSettings={showSettings}
        showAdmin={showAdmin}
        onLogout={onLogout}
      />
      <SidebarInset>
        {/* Mobile-only top bar */}
        <header className="flex h-[65px] shrink-0 items-center gap-2 border-b border-border px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-base font-bold text-brand-green">HGM</span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
