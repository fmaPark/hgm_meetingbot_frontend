"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ChevronDown, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export type ActiveMenu = "meeting" | "settings" | "admin"

export interface GNBProps {
  activeMenu: ActiveMenu
  userName: string
  showSettings?: boolean
  showAdmin?: boolean
  onLogout: () => void
}

interface NavItem {
  label: string
  href: string
  key: ActiveMenu
}

export function GNB({
  activeMenu,
  userName,
  showSettings = false,
  showAdmin = false,
  onLogout,
}: GNBProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { label: "회의록", href: "/dashboard", key: "meeting" },
    ...(showSettings
      ? [{ label: "설정", href: "/settings/projects", key: "settings" as ActiveMenu }]
      : []),
    ...(showAdmin
      ? [{ label: "관리자", href: "/admin/users", key: "admin" as ActiveMenu }]
      : []),
  ]

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-14 border-b border-border bg-card">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Left: Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-bold text-brand-green"
          aria-label="HGM 홈으로 이동"
        >
          HGM
        </Link>

        {/* Center: Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = activeMenu === item.key
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm transition-colors",
                  isActive
                    ? "font-semibold text-foreground"
                    : "font-medium text-text-secondary hover:text-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-green" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right: Desktop User Dropdown + Logout */}
        <div className="hidden items-center gap-2 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-1.5 text-sm font-medium text-foreground"
              >
                {userName}
                <ChevronDown className="size-4 text-text-secondary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="size-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Mobile Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="메뉴 열기"
        >
          <Menu className="size-5" />
        </Button>

        {/* Mobile Sheet Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="w-[300px] p-0">
            <SheetHeader className="border-b border-border px-4 py-3">
              <SheetTitle className="text-base font-semibold text-foreground">
                메뉴
              </SheetTitle>
            </SheetHeader>

            {/* Mobile Navigation Links */}
            <div className="flex flex-1 flex-col">
              <div className="flex flex-col gap-1 p-4">
                {navItems.map((item) => {
                  const isActive = activeMenu === item.key
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex min-h-[44px] items-center rounded-lg px-3 text-sm transition-colors",
                        isActive
                          ? "bg-brand-green/10 font-semibold text-brand-green"
                          : "font-medium text-text-secondary hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              {/* Mobile User Info + Logout */}
              <div className="mt-auto border-t border-border p-4">
                <div className="mb-3 text-sm font-medium text-foreground">
                  {userName}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setMobileOpen(false)
                    onLogout()
                  }}
                >
                  <LogOut className="size-4" />
                  로그아웃
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
