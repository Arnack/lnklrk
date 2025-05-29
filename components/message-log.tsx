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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ChevronRight,
  FileText,
  Wand2
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { useGmail } from "@/hooks/use-gmail"
import { toast } from "sonner"
import { 
  emailTemplates, 
  getTemplatesByCategory, 
  getTemplateById, 
  replaceVariables, 
  extractVariables,
  type EmailTemplate 
} from "@/lib/email-templates"

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
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
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

  // Auto-fill common variables when template is selected
  useEffect(() => {
    if (selectedTemplate && influencerName) {
      const commonVariables: Record<string, string> = {
        influencerName: influencerName,
        // Add other common variables here as needed
      }
      setTemplateVariables(prev => ({ ...commonVariables, ...prev }))
    }
  }, [selectedTemplate, influencerName])

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

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId)
    if (template) {
      setSelectedTemplate(template)
      // Initialize variables with common ones
      const variables: Record<string, string> = {
        influencerName: influencerName || '',
      }
      setTemplateVariables(variables)
      
      // Apply template with current variables
      const processedSubject = replaceVariables(template.subject, variables)
      const processedContent = replaceVariables(template.content, variables)
      
      setEmailToSend({
        subject: processedSubject,
        content: processedContent,
      })
    }
  }

  const handleVariableChange = (variable: string, value: string) => {
    const newVariables = { ...templateVariables, [variable]: value }
    setTemplateVariables(newVariables)
    
    if (selectedTemplate) {
      const processedSubject = replaceVariables(selectedTemplate.subject, newVariables)
      const processedContent = replaceVariables(selectedTemplate.content, newVariables)
      
      setEmailToSend({
        subject: processedSubject,
        content: processedContent,
      })
    }
  }

  const resetEmailForm = () => {
    setEmailToSend({ subject: "", content: "" })
    setSelectedTemplate(null)
    setTemplateVariables({})
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
      resetEmailForm()
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
                        ? 'bg-white border border-border rounded-tl-sm dark:bg-gray-800 dark:border-gray-700' 
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
        <Dialog open={isSendingEmail} onOpenChange={(open) => {
          setIsSendingEmail(open)
          if (!open) resetEmailForm()
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Email to {influencerEmail || "Influencer"}
              </DialogTitle>
              <DialogDescription>
                Choose a template or compose a custom email
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Custom
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                {/* Template Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['collaboration', 'follow-up', 'contract', 'introduction'].map((category) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm capitalize">{category}</h4>
                      <div className="space-y-1">
                        {getTemplatesByCategory(category as EmailTemplate['category']).map((template) => (
                          <Button
                            key={template.id}
                            variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTemplateSelect(template.id)}
                            className="w-full text-left justify-start h-auto p-2"
                          >
                            <div className="text-xs">
                              {template.name}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Template Variables */}
                {selectedTemplate && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      Customize Template: {selectedTemplate.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {extractVariables(selectedTemplate).map((variable) => (
                        <div key={variable} className="space-y-1">
                          <Label htmlFor={`var-${variable}`} className="text-xs">
                            {variable.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                          <Input
                            id={`var-${variable}`}
                            value={templateVariables[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            placeholder={`Enter ${variable}`}
                            className="h-8 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Template Preview */}
                {selectedTemplate && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-subject">Subject</Label>
                      <Input
                        id="template-subject"
                        value={emailToSend.subject}
                        onChange={(e) => setEmailToSend({ ...emailToSend, subject: e.target.value })}
                        placeholder="Email subject"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-content">Content</Label>
                      <Textarea
                        id="template-content"
                        value={emailToSend.content}
                        onChange={(e) => setEmailToSend({ ...emailToSend, content: e.target.value })}
                        placeholder="Email content"
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-subject">Subject</Label>
                    <Input
                      id="custom-subject"
                      placeholder="Email subject"
                      value={emailToSend.subject}
                      onChange={(e) => setEmailToSend({ ...emailToSend, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-content">Content</Label>
                    <Textarea
                      id="custom-content"
                      placeholder="Email content"
                      value={emailToSend.content}
                      onChange={(e) => setEmailToSend({ ...emailToSend, content: e.target.value })}
                      className="min-h-[300px]"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSendingEmail(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail} 
                disabled={isLoading || !emailToSend.subject.trim() || !emailToSend.content.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
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
