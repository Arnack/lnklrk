"use client"

import { User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-provider"
import { useRouter } from "next/navigation"
import LS from "@/app/service/LS"

export function UserMenu() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Server logout failed:', error)
    } finally {
      // Always clear client-side data regardless of server response
      logout()
    }
  }

  const handleSettingsClick = () => {
    router.push('/settings')
  }

  // Get user information from localStorage
  const userId = LS.getUserId()
  const { user } = LS.getUserInfo()
  
  // Create initials from user email or ID
  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    if (userId) {
      return userId.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const getDisplayName = () => {
    if (user?.name) return user.name
    if (user?.email) return user.email
    if (userId) return `User ${userId.substring(0, 8)}`
    return "User"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={getDisplayName()} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "No email available"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 