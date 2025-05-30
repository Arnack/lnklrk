"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import LS from "@/app/service/LS"

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  expirationDate: z.date({
    required_error: "Expiration date is required",
  }),
  type: z.enum(["general", "influencer", "campaign"]),
  priority: z.enum(["low", "medium", "high"]),
  influencerId: z.string().optional(),
  campaignId: z.string().optional(),
})

type ReminderFormData = z.infer<typeof reminderSchema>

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

interface CreateReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReminderCreated: (reminder: Reminder) => void
}

export function CreateReminderDialog({
  open,
  onOpenChange,
  onReminderCreated,
}: CreateReminderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [influencers, setInfluencers] = useState<Array<{id: string, handle: string}>>([])
  const [campaigns, setCampaigns] = useState<Array<{id: string, name: string}>>([])

  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "general",
      priority: "medium",
    },
  })

  const watchType = form.watch("type")

  useEffect(() => {
    if (open) {
      fetchInfluencers()
      fetchCampaigns()
    }
  }, [open])

  useEffect(() => {
    // Reset related fields when type changes
    if (watchType !== "influencer") {
      form.setValue("influencerId", undefined)
    }
    if (watchType !== "campaign") {
      form.setValue("campaignId", undefined)
    }
  }, [watchType, form])

  const fetchInfluencers = async () => {
    try {
      const response = await fetch('/api/influencers', {
        headers: {
          'x-user-id': LS.getUserId() || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        setInfluencers(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch influencers:', error)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        headers: {
          'x-user-id': LS.getUserId() || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    }
  }

  const onSubmit = async (data: ReminderFormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        expirationDate: data.expirationDate.toISOString(),
        influencerId: data.type === "influencer" ? data.influencerId : undefined,
        campaignId: data.type === "campaign" ? data.campaignId : undefined,
      }

      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': LS.getUserId() || ''
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        onReminderCreated(result.reminder)
        form.reset()
        onOpenChange(false)
      } else {
        const error = await response.json()
        console.error('Failed to create reminder:', error.error)
      }
    } catch (error) {
      console.error('Failed to create reminder:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Reminder</DialogTitle>
          <DialogDescription>
            Create a reminder for yourself, an influencer, or a campaign.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter reminder title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter reminder description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="influencer">Influencer</SelectItem>
                        <SelectItem value="campaign">Campaign</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchType === "influencer" && (
              <FormField
                control={form.control}
                name="influencerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Influencer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select influencer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {influencers.map((influencer) => (
                          <SelectItem key={influencer.id} value={influencer.id}>
                            {influencer.handle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchType === "campaign" && (
              <FormField
                control={form.control}
                name="campaignId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            // If we already have a time set, preserve it, otherwise set to current time or 9 AM
                            const existingTime = field.value ? field.value : new Date()
                            const currentHour = existingTime.getHours()
                            const currentMinute = existingTime.getMinutes()
                            
                            // If no previous time was set, default to 9:00 AM
                            const hour = field.value ? currentHour : 9
                            const minute = field.value ? currentMinute : 0
                            
                            date.setHours(hour)
                            date.setMinutes(minute)
                            field.onChange(date)
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const time = e.target.value
                              if (time) {
                                const [hours, minutes] = time.split(':')
                                let newDate = field.value ? new Date(field.value) : new Date()
                                
                                // If no date was selected, default to today
                                if (!field.value) {
                                  newDate = new Date()
                                  // Don't allow past dates
                                  const now = new Date()
                                  if (newDate < now) {
                                    newDate = now
                                  }
                                }
                                
                                newDate.setHours(parseInt(hours))
                                newDate.setMinutes(parseInt(minutes))
                                field.onChange(newDate)
                              }
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select when this reminder should be due.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 