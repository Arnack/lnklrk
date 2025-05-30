"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Megaphone
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  influencerId?: string
  campaignId?: string
  metadata?: {
    tags?: string[]
    color?: string
  }
  createdAt: string
  updatedAt: string
}

interface ReminderListProps {
  reminders: Reminder[]
  loading: boolean
  onReminderUpdated: (reminder: Reminder) => void
  onReminderDeleted: (reminderId: string) => void
}

export function ReminderList({ 
  reminders, 
  loading, 
  onReminderUpdated, 
  onReminderDeleted 
}: ReminderListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'influencer':
        return <User className="h-4 w-4" />
      case 'campaign':
        return <Megaphone className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const handleMarkCompleted = async (reminder: Reminder) => {
    setUpdatingId(reminder.id)
    try {
      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': LS.getUserId() || ''
        },
        body: JSON.stringify({ isCompleted: !reminder.isCompleted }),
      })

      if (response.ok) {
        const data = await response.json()
        onReminderUpdated(data.reminder)
      }
    } catch (error) {
      console.error('Failed to update reminder:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (reminderId: string) => {
    setDeletingId(reminderId)
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': LS.getUserId() || ''
        }
      })

      if (response.ok) {
        onReminderDeleted(reminderId)
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reminders found</h3>
          <p className="text-muted-foreground text-center">
            Create a new reminder to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  console.log('reminders >>>', reminders)

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className={`transition-all ${
          reminder?.isExpired && !reminder?.isCompleted ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' :
          reminder?.isCompleted ? 'opacity-60' : ''
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {reminder && reminder.type ? getTypeIcon(reminder.type) : <Calendar className="h-4 w-4" />}
                    <CardTitle className={`text-lg ${reminder?.isCompleted ? 'line-through' : ''}`}>
                      {reminder.title}
                    </CardTitle>
                  </div>
                  <Badge className={getPriorityColor(reminder.priority || 'medium')}>
                    {reminder.priority || 'medium'}
                  </Badge>
                </div>
                
                {reminder.description && (
                  <p className="text-sm text-muted-foreground">
                    {reminder.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(reminder.expirationDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {reminder.isExpired && !reminder.isCompleted ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : reminder.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                    <span className={
                      reminder.isExpired && !reminder.isCompleted ? 'text-red-600 dark:text-red-400' :
                      reminder.isCompleted ? 'text-green-600 dark:text-green-400' :
                      'text-blue-600 dark:text-blue-400'
                    }>
                      {reminder.isCompleted ? 'Completed' : 
                       reminder.isExpired ? 'Expired' : 
                       formatTimeLeft(reminder.expirationDate)}
                    </span>
                  </div>
                  
                  <Badge variant="outline" className="capitalize">
                    {reminder.type || 'general'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkCompleted(reminder)}
                  disabled={updatingId === reminder.id}
                  className={reminder.isCompleted ? 'bg-green-50 border-green-200' : ''}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {reminder.isCompleted ? 'Completed' : 'Mark Done'}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={deletingId === reminder.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{reminder.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(reminder.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
} 