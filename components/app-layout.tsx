"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/stores/auth-store"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const { user, clearAuth, hasAnyPermission } = useAuthStore()

  const userName = user?.username ?? ""
  const showSettings = hasAnyPermission([
    "project:create", "part:create", "prompt:manage", "keyword:manage",
  ])
  const showAdmin = hasAnyPermission([
    "user:read", "rbac:manage", "settings:manage_llm",
  ])

  function handleLogout() {
    clearAuth()
    router.push("/login")
  }

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar
          userName={userName}
          showSettings={showSettings}
          showAdmin={showAdmin}
          onLogout={handleLogout}
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
    </AuthGuard>
  )
}
