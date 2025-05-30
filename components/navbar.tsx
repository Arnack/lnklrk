"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { ReminderNotification } from "@/components/reminder-notification"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  BarChart3, 
  Settings, 
  FileText,
  Target,
  Bell
} from "lucide-react"

const navigationItems = [
  // {
  //   name: "Dashboard",
  //   href: "/dashboard",
  //   icon: LayoutDashboard,
  //   description: "Overview and analytics"
  // },
  {
    name: "Influencers",
    href: "/dashboard", // Since influencers are shown on dashboard
    icon: Users,
    description: "Manage influencers"
  },
  {
    name: "Campaigns",
    href: "/campaigns",
    icon: Megaphone,
    description: "Campaign management"
  },
  // {
  //   name: "Reminders",
  //   href: "/reminders",
  //   icon: Bell,
  //   description: "Manage reminders"
  // },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Performance insights"
  },
  // {
  //   name: "Reports",
  //   href: "/reports",
  //   icon: FileText,
  //   description: "Generate reports"
  // }
]

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const isActivePath = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/influencers")
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Chinny CRM</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isActivePath(item.href)
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right side - Reminder notification, Theme toggle and User menu */}
          <div className="flex items-center space-x-2">
            <ReminderNotification />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isActivePath(item.href)
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-1",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="text-xs">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
} 