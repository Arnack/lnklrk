"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  ArrowDown, 
  ArrowUp, 
  Trash2, 
  Mail,
  Calendar
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface Message {
  id: string
  direction: "incoming" | "outgoing"
  subject: string
  content: string
  date: string
}

interface MessageLogProps {
  messages: Message[]
  onUpdate: (messages: Message[]) => void
  influencerEmail?: string
  influencerName?: string
}

export function MessageLog({ messages, onUpdate, influencerEmail, influencerName }: MessageLogProps) {
  const [isAddingMessage, setIsAddingMessage] = useState(false)
  
  const [newMessage, setNewMessage] = useState<Omit<Message, "id" | "date">>({
    direction: "outgoing",
    subject: "",
    content: "",
  })

  const handleAddMessage = () => {
    if (newMessage.subject.trim() && newMessage.content.trim()) {
      const message: Message = {
        id: uuidv4(),
        ...newMessage,
        date: new Date().toISOString(),
      }

      onUpdate([...messages, message])
      setNewMessage({
        direction: "outgoing",
        subject: "",
        content: "",
      })
      setIsAddingMessage(false)
    }
  }

  const handleDeleteMessage = (id: string) => {
    onUpdate(messages.filter((message) => message.id !== id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Message Log
            {influencerEmail && (
              <Badge variant="outline" className="text-xs">
                <Mail className="h-3 w-3 mr-1" />
                {influencerEmail}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Track conversations with this influencer</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingMessage(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Message
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <div>No messages logged yet</div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border rounded-md ${
                  message.direction === "incoming" ? "bg-muted/30" : "bg-primary/5"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {message.direction === "incoming" ? (
                      <ArrowDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-blue-500" />
                    )}
                    <div className="font-medium">{message.subject}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(message.date)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMessage(message.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add Message Dialog */}
        <Dialog open={isAddingMessage} onOpenChange={setIsAddingMessage}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Message</DialogTitle>
              <DialogDescription>Manually log a conversation</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="message-direction">Direction</Label>
                <Select
                  value={newMessage.direction}
                  onValueChange={(value: "incoming" | "outgoing") => setNewMessage({ ...newMessage, direction: value })}
                >
                  <SelectTrigger id="message-direction">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Incoming (from influencer)</SelectItem>
                    <SelectItem value="outgoing">Outgoing (to influencer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message-subject">Subject</Label>
                <Input
                  id="message-subject"
                  placeholder="Message subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message-content">Content</Label>
                <Textarea
                  id="message-content"
                  placeholder="Message content"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  className="min-h-[150px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingMessage(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMessage}>Add Message</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
