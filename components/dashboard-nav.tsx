"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, MessageSquare, BarChart3, Settings, Users, FileText, CreditCard } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  employeeOnly?: boolean
  adminOnly?: boolean
  systemAdminOnly?: boolean
}

const navItems: NavItem[] = [
  // Employee-only items
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    employeeOnly: true,
  },
  {
    title: "My Submissions",
    href: "/dashboard/submissions",
    icon: FileText,
    employeeOnly: true,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    employeeOnly: true,
  },
  // Admin items (P&C admin and System admin)
  {
    title: "Feedback",
    href: "/admin/feedback",
    icon: MessageSquare,
    adminOnly: true,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    title: "Polls",
    href: "/admin/polls",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    adminOnly: true,
  },
  // System admin only items
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    systemAdminOnly: true,
  },
  {
    title: "Billing",
    href: "/admin/billing",
    icon: CreditCard,
    systemAdminOnly: true,
  },
]

interface DashboardNavProps {
  isAdmin?: boolean
  isSystemAdmin?: boolean
}

export function DashboardNav({ isAdmin = false, isSystemAdmin = false }: DashboardNavProps) {
  const pathname = usePathname()

  const filteredItems = navItems.filter((item) => {
    // System admin only items
    if (item.systemAdminOnly) return isSystemAdmin

    // Admin only items (for both P&C admin and system admin)
    if (item.adminOnly) return isAdmin || isSystemAdmin

    // Employee only items
    if (item.employeeOnly) return !isAdmin && !isSystemAdmin

    // If no specific flags, show for everyone (fallback)
    return true
  })

  return (
    <nav className="flex flex-col gap-1">
      {filteredItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
