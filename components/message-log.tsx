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
  Download,
  ChevronDown,
  ChevronRight
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
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
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

  const toggleMessageExpansion = (messageId: string) => {
    const newExpanded = new Set(expandedMessages)
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId)
    } else {
      newExpanded.add(messageId)
    }
    setExpandedMessages(newExpanded)
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + "..."
  }

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
          <div className="space-y-4 max-h-[600px] overflow-y-auto p-4 bg-gradient-to-b from-muted/20 to-background rounded-lg">
            {messages.map((message) => {
              const isExpanded = expandedMessages.has(message.id)
              const needsTruncation = message.content.length > 150
              const isIncoming = message.direction === "incoming"
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isIncoming ? 'justify-start' : 'justify-end'} mb-4 group`}
                >
                  <div className={`flex ${isIncoming ? 'flex-row' : 'flex-row-reverse'} items-end max-w-[80%] gap-2`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      isIncoming 
                        ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                        : 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    }`}>
                      {isIncoming ? (influencerName?.[0]?.toUpperCase() || 'T') : 'Y'}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`relative rounded-2xl px-4 py-3 shadow-sm transition-all ${
                      isIncoming 
                        ? 'bg-white border border-border rounded-tl-sm' 
                        : 'bg-primary text-primary-foreground rounded-tr-sm'
                    }`}>
                      {/* Message Header */}
                      <div className={`flex items-center gap-2 mb-2 text-xs ${
                        isIncoming ? 'justify-start' : 'justify-end'
                      }`}>
                        <div className={`font-medium ${
                          isIncoming ? 'text-muted-foreground' : 'text-primary-foreground/80'
                        }`}>
                          {message.subject}
                        </div>
                        <div className={`${
                          isIncoming ? 'text-muted-foreground' : 'text-primary-foreground/70'
                        }`}>
                          {formatDate(message.date)}
                        </div>
                      </div>
                      
                      {/* Message Content */}
                      <div className={`text-sm leading-relaxed ${
                        isIncoming ? 'text-foreground' : 'text-primary-foreground'
                      }`}>
                        <div className="whitespace-pre-wrap">
                          {isExpanded || !needsTruncation 
                            ? message.content 
                            : truncateContent(message.content)
                          }
                        </div>
                        
                        {/* Expand/Collapse Controls */}
                        {needsTruncation && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMessageExpansion(message.id)}
                              className={`h-6 px-2 text-xs ${
                                isIncoming 
                                  ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                                  : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                              }`}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-3 w-3 mr-1" />
                                  Show more
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMessage(message.id)}
                        className={`absolute -top-2 ${isIncoming ? '-right-2' : '-left-2'} h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                          isIncoming 
                            ? 'bg-white border border-border hover:bg-muted text-muted-foreground' 
                            : 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                        }`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Scroll to bottom spacer */}
            <div className="h-1" />
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
