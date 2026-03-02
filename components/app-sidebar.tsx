"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  Settings,
  Shield,
  LogOut,
  ChevronUp,
} from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

interface AppSidebarProps {
  userName: string
  showSettings?: boolean
  showAdmin?: boolean
  onLogout: () => void
}

const NAV_ITEMS = [
  {
    key: "meeting",
    label: "회의록",
    href: "/",
    icon: FileText,
    matchPrefix: ["/", "/dashboard"],
  },
  {
    key: "settings",
    label: "설정",
    href: "/settings/projects",
    icon: Settings,
    matchPrefix: ["/settings"],
    requiresPermission: "showSettings" as const,
  },
  {
    key: "admin",
    label: "관리자",
    href: "/admin/users",
    icon: Shield,
    matchPrefix: ["/admin"],
    requiresPermission: "showAdmin" as const,
  },
]

export function AppSidebar({
  userName,
  showSettings = false,
  showAdmin = false,
  onLogout,
}: AppSidebarProps) {
  const pathname = usePathname()

  const permissions: Record<string, boolean> = {
    showSettings,
    showAdmin,
  }

  function isActive(matchPrefix: string[]): boolean {
    // Special case: root "/" should only match exact "/" or "/dashboard" paths
    if (matchPrefix.includes("/") && matchPrefix.includes("/dashboard")) {
      return (
        pathname === "/" ||
        pathname.startsWith("/dashboard")
      )
    }
    return matchPrefix.some((prefix) => pathname.startsWith(prefix))
  }

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.requiresPermission) {
      return permissions[item.requiresPermission]
    }
    return true
  })

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent active:bg-transparent"
            >
              <Link href="/">
                <div className="flex size-8 items-center justify-center rounded-md bg-brand-green text-primary-foreground">
                  <span className="text-sm font-bold">H</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-base font-bold text-brand-green">
                    HGM
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Workspace
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const active = isActive(item.matchPrefix)
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                    {userName.charAt(0)}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
