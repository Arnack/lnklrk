"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import LS from "@/app/service/LS"

interface Reminder {
  id: string
  title: string
  description?: string
  expirationDate: string
  priority: 'low' | 'medium' | 'high'
  type: 'general' | 'influencer' | 'campaign'
  isExpired: boolean
  isCompleted: boolean
}

export function ReminderNotification() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchActiveReminders()
  }, [])

  const fetchActiveReminders = async () => {
    try {
      const response = await fetch('/api/reminders?active=true&limit=5', {
        headers: {
          'x-user-id': LS.getUserId() || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        setReminders(data.reminders || [])
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewAllReminders = () => {
    router.push('/reminders')
  }

  const handleMarkAsCompleted = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': LS.getUserId() || ''
        },
        body: JSON.stringify({ isCompleted: true }),
      })

      if (response.ok) {
        setReminders(prev => prev.filter(r => r.id !== reminderId))
      }
    } catch (error) {
      console.error('Failed to mark reminder as completed:', error)
    }
  }

  const formatTimeLeft = (expirationDate: string) => {
    const now = new Date()
    const expiry = new Date(expirationDate)
    const diffInHours = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 0) return "Expired"
    if (diffInHours < 24) return `${diffInHours}h left`
    const days = Math.ceil(diffInHours / 24)
    return `${days}d left`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'low':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const activeRemindersCount = reminders.filter(r => !r.isExpired && !r.isCompleted).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Bell className="h-5 w-5 text-primary" />
          {activeRemindersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {activeRemindersCount > 9 ? '9+' : activeRemindersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Reminders</p>
            <p className="text-xs leading-none text-muted-foreground">
              {activeRemindersCount} active reminder{activeRemindersCount !== 1 ? 's' : ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {reminders.length === 0 ? (
          <div className="p-3 text-center text-sm text-muted-foreground">
            No active reminders
          </div>
        ) : (
          <>
            {reminders.slice(0, 4).map((reminder) => (
              <DropdownMenuItem
                key={reminder.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  router.push(`/reminders?reminder=${reminder.id}`)
                }}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{reminder.title}</p>
                    {reminder.description && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeLeft(reminder.expirationDate)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-16 text-xs ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsCompleted(reminder.id)
                    }}
                  >
                    Done
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-center justify-center"
              onClick={handleViewAllReminders}
            >
              View all reminders
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 