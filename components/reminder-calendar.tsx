"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react"

interface Reminder {
  id: string
  title: string
  description?: string
  expirationDate: string
  priority: 'low' | 'medium' | 'high'
  type: 'general' | 'influencer' | 'campaign'
  isExpired: boolean
  isCompleted: boolean
  influencerId?: string
  campaignId?: string
  metadata?: {
    tags?: string[]
    color?: string
  }
  createdAt: string
  updatedAt: string
}

interface ReminderCalendarProps {
  reminders: Reminder[]
  loading: boolean
  onReminderUpdated: (reminder: Reminder) => void
  onReminderDeleted: (reminderId: string) => void
}

export function ReminderCalendar({ 
  reminders, 
  loading, 
  onReminderUpdated, 
  onReminderDeleted 
}: ReminderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) { // 6 rows * 7 days
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const getRemindersForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.expirationDate).toISOString().split('T')[0]
      return reminderDate === dateStr
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(42)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const days = getDaysInMonth()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {getMonthYear()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            const dayReminders = getRemindersForDate(date)
            const isCurrentMonthDay = isCurrentMonth(date)
            const isTodayDate = isToday(date)
            
            return (
              <div
                key={index}
                className={`
                  min-h-[80px] p-2 border rounded-lg transition-colors
                  ${isTodayDate ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : 'bg-background'}
                  ${!isCurrentMonthDay ? 'opacity-40' : ''}
                  ${dayReminders.length > 0 ? 'border-primary/30' : 'border-border'}
                `}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isTodayDate ? 'text-blue-600 dark:text-blue-400' : 
                  isCurrentMonthDay ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayReminders.slice(0, 3).map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`
                        text-xs p-1 rounded truncate cursor-pointer
                        ${reminder.isCompleted ? 'opacity-60 line-through' : ''}
                        ${reminder.isExpired && !reminder.isCompleted ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                          (reminder.priority || 'medium') === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          (reminder.priority || 'medium') === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                      `}
                      title={`${reminder.title}${reminder.description ? ` - ${reminder.description}` : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(reminder.priority || 'medium')}`}></div>
                        <span className="truncate">{reminder.title}</span>
                      </div>
                    </div>
                  ))}
                  
                  {dayReminders.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayReminders.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Low Priority</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 