"use client"

import { useState, useEffect } from "react"
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
  Calendar,
  RefreshCw,
  Send,
  Link,
  Download
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { useGmail } from "@/hooks/use-gmail"
import { toast } from "sonner"

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
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const { isAuthenticated, isLoading, error, authenticate, fetchEmails, sendEmail } = useGmail()
  
  const [newMessage, setNewMessage] = useState<Omit<Message, "id" | "date">>({
    direction: "outgoing",
    subject: "",
    content: "",
  })

  const [emailToSend, setEmailToSend] = useState({
    subject: "",
    content: "",
  })

  // Auto-load Gmail emails when authenticated and influencer email is available
  useEffect(() => {
    if (isAuthenticated && influencerEmail) {
      handleFetchEmails()
    }
  }, [isAuthenticated, influencerEmail])

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

  const handleFetchEmails = async () => {
    if (!influencerEmail) {
      toast.error("No influencer email provided")
      return
    }

    try {
      const gmailEmails = await fetchEmails(influencerEmail)
      
      // Convert Gmail emails to our message format
      const convertedMessages: Message[] = gmailEmails.map(email => ({
        id: email.id,
        direction: email.direction,
        subject: email.subject,
        content: email.content,
        date: email.date,
      }))

      // Merge with existing messages, avoiding duplicates
      const existingIds = new Set(messages.map(m => m.id))
      const newMessages = convertedMessages.filter(m => !existingIds.has(m.id))
      
      if (newMessages.length > 0) {
        onUpdate([...messages, ...newMessages])
        toast.success(`Loaded ${newMessages.length} emails from Gmail`)
      } else {
        toast.info("No new emails found")
      }
    } catch (err) {
      console.error("Error fetching emails:", err)
      toast.error(err instanceof Error ? err.message : "Failed to fetch emails")
    }
  }

  const handleSendEmail = async () => {
    if (!influencerEmail) {
      toast.error("No influencer email provided")
      return
    }

    if (!emailToSend.subject.trim() || !emailToSend.content.trim()) {
      toast.error("Please fill in both subject and content")
      return
    }

    try {
      await sendEmail(influencerEmail, emailToSend.subject, emailToSend.content)
      
      // Add the sent email to the message log
      const sentMessage: Message = {
        id: uuidv4(),
        direction: "outgoing",
        subject: emailToSend.subject,
        content: emailToSend.content,
        date: new Date().toISOString(),
      }

      onUpdate([...messages, sentMessage])
      
      // Reset form
      setEmailToSend({ subject: "", content: "" })
      setIsSendingEmail(false)
      
      toast.success("Email sent successfully!")
    } catch (err) {
      console.error("Error sending email:", err)
      toast.error(err instanceof Error ? err.message : "Failed to send email")
    }
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
            {isAuthenticated && (
              <Badge variant="secondary" className="text-xs">
                <Link className="h-3 w-3 mr-1" />
                Gmail Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Track conversations with this influencer</CardDescription>
        </div>
        <div className="flex gap-2">
          {!isAuthenticated ? (
            <Button onClick={authenticate} size="sm" disabled={isLoading}>
              <Link className="h-4 w-4 mr-2" />
              Connect Gmail
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleFetchEmails} 
                size="sm" 
                variant="outline"
                disabled={isLoading || !influencerEmail}
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Sync Emails"}
              </Button>
              <Button 
                onClick={() => setIsSendingEmail(true)} 
                size="sm"
                disabled={!influencerEmail}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </>
          )}
          <Button onClick={() => setIsAddingMessage(true)} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Message
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 border border-red-200 bg-red-50 rounded-md text-sm text-red-600">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <div>No messages logged yet</div>
            {influencerEmail && !isAuthenticated && (
              <p className="text-sm mt-2">Connect Gmail to automatically sync conversations</p>
            )}
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

        {/* Send Email Dialog */}
        <Dialog open={isSendingEmail} onOpenChange={setIsSendingEmail}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
              <DialogDescription>
                Send an email to {influencerEmail || "the influencer"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Email subject"
                  value={emailToSend.subject}
                  onChange={(e) => setEmailToSend({ ...emailToSend, subject: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email-content">Content</Label>
                <Textarea
                  id="email-content"
                  placeholder="Email content"
                  value={emailToSend.content}
                  onChange={(e) => setEmailToSend({ ...emailToSend, content: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSendingEmail(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
