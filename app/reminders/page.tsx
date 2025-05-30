"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, List, Plus, Filter, Search } from "lucide-react"
import { ReminderCalendar } from "@/components/reminder-calendar"
import { ReminderList } from "@/components/reminder-list"
import { CreateReminderDialog } from "@/components/create-reminder-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LS from "../service/LS"

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

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('list')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('active')

  useEffect(() => {
    fetchReminders()
  }, [typeFilter, priorityFilter, statusFilter])

  const fetchReminders = async () => {
    console.log('fetchReminders >>>')
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (statusFilter === 'active') {
        params.append('active', 'true')
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }
      if (priorityFilter !== 'all') {
        params.append('priority', priorityFilter)
      }
      params.append('limit', '100') // Get more for calendar view

      const response = await fetch(`/api/reminders?${params.toString()}`, {
        headers: {
          'x-user-id': LS.getUserId() || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('data >>>', data)
        setReminders(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReminderCreated = (newReminder: Reminder) => {
    setReminders(prev => [newReminder, ...prev])
    setIsCreateDialogOpen(false)
  }

  const handleReminderUpdated = (updatedReminder: Reminder) => {
    if (!updatedReminder) return
    setReminders(prev => 
      prev.map(r => r.id === updatedReminder.id ? updatedReminder : r)
    )
  }

  const handleReminderDeleted = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId))
  }

  const filteredReminders = reminders.filter(reminder => {
    if (searchTerm && !reminder.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  })

  const activeRemindersCount = reminders.filter(r => !r?.isExpired && !r?.isCompleted).length
  const expiredRemindersCount = reminders.filter(r => r?.isExpired && !r?.isCompleted).length
  const completedRemindersCount = reminders.filter(r => r?.isCompleted).length

  console.log('reminders page >>>', reminders)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">
            Manage your reminders for influencers and campaigns
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Reminder
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeRemindersCount}</div>
            <p className="text-xs text-muted-foreground">Not expired or completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredRemindersCount}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedRemindersCount}</div>
            <p className="text-xs text-muted-foreground">Finished tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="influencer">Influencer</SelectItem>
            <SelectItem value="campaign">Campaign</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Toggle and Content */}
      <Tabs value={view} onValueChange={(value) => setView(value as 'calendar' | 'list')}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ReminderList
            reminders={filteredReminders}
            loading={loading}
            onReminderUpdated={handleReminderUpdated}
            onReminderDeleted={handleReminderDeleted}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <ReminderCalendar
            reminders={filteredReminders}
            loading={loading}
            onReminderUpdated={handleReminderUpdated}
            onReminderDeleted={handleReminderDeleted}
          />
        </TabsContent>
      </Tabs>

      {/* Create Reminder Dialog */}
      <CreateReminderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onReminderCreated={handleReminderCreated}
      />
    </div>
  )
} 