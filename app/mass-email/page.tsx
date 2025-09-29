"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Mail, 
  Users, 
  Send, 
  FileText, 
  Wand2, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckSquare,
  Square
} from "lucide-react"
import { toast } from "sonner"
import { useGmail } from "@/hooks/use-gmail"
import { useMassEmail } from "@/hooks/use-mass-email"
import { useAuth } from "@/context/auth-provider"
import LS from "@/app/service/LS"
import { GmailSetupAlert } from "@/components/gmail-setup-alert"
import { 
  emailTemplates, 
  getTemplatesByCategory, 
  getTemplatesByCategories,
  getTemplateById, 
  replaceVariables, 
  extractVariables,
  type EmailTemplate 
} from "@/lib/email-templates"

interface Recipient {
  id: string
  name: string
  email: string
  platform?: string
  followers?: number
  category?: string
  tags?: string[]
  customFields?: Record<string, string>
}

interface MassEmailCampaign {
  id: string
  name: string
  subject: string
  content: string
  recipients: Recipient[]
  status: 'draft' | 'sending' | 'sent' | 'failed'
  createdAt: string
  sentAt?: string
  stats: {
    total: number
    sent: number
    failed: number
    pending: number
  }
}

export default function MassEmailPage() {
  const [currentCampaign, setCurrentCampaign] = useState<MassEmailCampaign | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set())
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [emailContent, setEmailContent] = useState({
    subject: "",
    content: ""
  })
  const [sendingProgress, setSendingProgress] = useState(0)
  const [showRecipients, setShowRecipients] = useState(false)

  const { isAuthenticated, isLoading, sendEmail } = useGmail()
  const { user, isAuthenticated: userAuthenticated, isLoading: authLoading } = useAuth()
  const { 
    campaigns, 
    isLoading: campaignsLoading, 
    createCampaign, 
    updateCampaign, 
    deleteCampaign, 
    sendCampaign 
  } = useMassEmail({ userId: LS.getUserId() || "20b93366-6615-4318-8429-e180ad823eae", autoFetch: !!userAuthenticated })

  // Load sample recipients (in real app, this would come from API)
  useEffect(() => {
    const sampleRecipients: Recipient[] = [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        platform: "Instagram",
        followers: 50000,
        category: "Fashion",
        tags: ["fashion", "lifestyle"],
        customFields: { location: "New York", rate: "500" }
      },
      {
        id: "2", 
        name: "Mike Chen",
        email: "mike@example.com",
        platform: "YouTube",
        followers: 120000,
        category: "Tech",
        tags: ["tech", "gaming"],
        customFields: { location: "San Francisco", rate: "800" }
      },
      {
        id: "3",
        name: "Emma Wilson",
        email: "emma@example.com", 
        platform: "TikTok",
        followers: 200000,
        category: "Beauty",
        tags: ["beauty", "skincare"],
        customFields: { location: "Los Angeles", rate: "1200" }
      },
      {
        id: "4",
        name: "David Rodriguez",
        email: "david@example.com",
        platform: "Instagram",
        followers: 75000,
        category: "Fitness",
        tags: ["fitness", "health"],
        customFields: { location: "Miami", rate: "600" }
      },
      {
        id: "5",
        name: "Lisa Park",
        email: "lisa@example.com",
        platform: "YouTube",
        followers: 300000,
        category: "Food",
        tags: ["food", "cooking"],
        customFields: { location: "Seattle", rate: "1500" }
      }
    ]
    setRecipients(sampleRecipients)
  }, [])

  const filteredRecipients = recipients.filter(recipient => {
    const matchesSearch = recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || recipient.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(recipients.map(r => r.category).filter(Boolean))) as string[]

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId)
    if (template) {
      setSelectedTemplate(template)
      setTemplateVariables({})
      setEmailContent({
        subject: template.subject,
        content: template.content
      })
    }
  }

  const handleVariableChange = (variable: string, value: string) => {
    const newVariables = { ...templateVariables, [variable]: value }
    setTemplateVariables(newVariables)
    
    if (selectedTemplate) {
      const processedSubject = replaceVariables(selectedTemplate.subject, newVariables)
      const processedContent = replaceVariables(selectedTemplate.content, newVariables)
      
      setEmailContent({
        subject: processedSubject,
        content: processedContent,
      })
    }
  }

  const handleRecipientToggle = (recipientId: string) => {
    const newSelected = new Set(selectedRecipients)
    if (newSelected.has(recipientId)) {
      newSelected.delete(recipientId)
    } else {
      newSelected.add(recipientId)
    }
    setSelectedRecipients(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRecipients.size === filteredRecipients.length) {
      setSelectedRecipients(new Set())
    } else {
      setSelectedRecipients(new Set(filteredRecipients.map(r => r.id)))
    }
  }

  const handleCreateCampaign = async () => {
    if (!emailContent.subject.trim() || !emailContent.content.trim()) {
      toast.error("Please fill in both subject and content")
      return
    }

    if (selectedRecipients.size === 0) {
      toast.error("Please select at least one recipient")
      return
    }

    try {
      const campaignData = {
        name: `Campaign ${campaigns.length + 1}`,
        subject: emailContent.subject,
        content: emailContent.content,
        recipients: recipients.filter(r => selectedRecipients.has(r.id)),
        templateId: selectedTemplate?.id,
        templateVariables
      }

      const campaign = await createCampaign(campaignData)
      setCurrentCampaign({
        ...campaign,
        recipients: campaign.recipients || []
      })
      setIsCreatingCampaign(false)
      setSelectedRecipients(new Set())
      setEmailContent({ subject: "", content: "" })
      setSelectedTemplate(null)
      setTemplateVariables({})
    } catch (error) {
      console.error("Error creating campaign:", error)
    }
  }

  const handleSendCampaign = async (campaign: MassEmailCampaign) => {
    if (!isAuthenticated) {
      toast.error("Please connect Gmail first")
      return
    }

    setIsSending(true)
    setSendingProgress(0)

    try {
      // Get Gmail access token (in real app, this would come from auth context)
      const gmailAccessToken = "your-gmail-access-token" // This should come from auth context
      
      const result = await sendCampaign(campaign.id, gmailAccessToken)
      
      // Update progress during sending
      const totalRecipients = campaign.recipients?.length || 0
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 10
        setSendingProgress(Math.min(progress, 90))
      }, 1000)

      // Wait for completion
      setTimeout(() => {
        clearInterval(progressInterval)
        setSendingProgress(100)
        setIsSending(false)
      }, totalRecipients * 2000) // Estimate 2 seconds per email

    } catch (error) {
      console.error("Error sending campaign:", error)
      setIsSending(false)
      setSendingProgress(0)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'sending':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'sending':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userAuthenticated || !user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-4">Mass Email</h1>
          <p className="text-muted-foreground mb-4">Please log in to access the mass email feature</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mass Email</h1>
          <p className="text-muted-foreground">Send personalized emails to multiple influencers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowRecipients(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Manage Recipients
          </Button>
          <Button onClick={() => setIsCreatingCampaign(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <GmailSetupAlert />

      {/* Campaigns Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.stats.total, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.stats.sent, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0)
                const totalFailed = campaigns.reduce((sum, c) => sum + c.stats.failed, 0)
                const total = totalSent + totalFailed
                return total > 0 ? `${Math.round((totalSent / total) * 100)}%` : "0%"
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>Manage your email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div>No campaigns yet</div>
              <p className="text-sm mt-2">Create your first campaign to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{campaign.name}</h3>
                      <Badge className={getStatusColor(campaign.status)}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1 capitalize">{campaign.status}</span>
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentCampaign(campaign)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendCampaign(campaign)}
                          disabled={isSending}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {campaign.subject}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{campaign.stats.total} recipients</span>
                    <span>{campaign.stats.sent} sent</span>
                    <span>{campaign.stats.failed} failed</span>
                    <span>{campaign.stats.pending} pending</span>
                  </div>
                  
                  {campaign.status === 'sending' && (
                    <div className="mt-2">
                      <Progress value={sendingProgress} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreatingCampaign} onOpenChange={setIsCreatingCampaign}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Mass Email Campaign</DialogTitle>
            <DialogDescription>
              Create and send personalized emails to multiple recipients
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="recipients" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="recipients" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Recipients</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedRecipients.size === filteredRecipients.length ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Select All
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search recipients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRecipients.size === filteredRecipients.length && filteredRecipients.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecipients.map((recipient) => (
                      <TableRow key={recipient.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRecipients.has(recipient.id)}
                            onCheckedChange={() => handleRecipientToggle(recipient.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{recipient.name}</TableCell>
                        <TableCell>{recipient.email}</TableCell>
                        <TableCell>{recipient.platform}</TableCell>
                        <TableCell>{recipient.followers?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{recipient.category}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Selected {selectedRecipients.size} recipient{selectedRecipients.size !== 1 ? 's' : ''}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Choose Template</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {Object.entries(getTemplatesByCategories()).map(([category, templates]) => (
                          <div key={category} className="space-y-1">
                            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {category}
                            </h5>
                            {templates.map((template) => (
                              <Button
                                key={template.id}
                                variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleTemplateSelect(template.id)}
                                className="w-full justify-start text-left h-auto p-3"
                              >
                                <div>
                                  <div className="font-medium text-sm">{template.name}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {template.variables.slice(0, 3).join(', ')}
                                    {template.variables.length > 3 && '...'}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedTemplate && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Template Variables</h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {extractVariables(selectedTemplate).map((variable) => (
                            <div key={variable} className="space-y-1">
                              <Label htmlFor={variable} className="text-xs">
                                {variable.charAt(0).toUpperCase() + variable.slice(1)}
                              </Label>
                              <Input
                                id={variable}
                                value={templateVariables[variable] || ''}
                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                placeholder={`Enter ${variable}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-subject">Subject</Label>
                      <Input
                        id="custom-subject"
                        placeholder="Email subject"
                        value={emailContent.subject}
                        onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-content">Content</Label>
                      <Textarea
                        id="custom-content"
                        placeholder="Email content"
                        value={emailContent.content}
                        onChange={(e) => setEmailContent({ ...emailContent, content: e.target.value })}
                        className="min-h-[300px]"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Preview</h3>
                
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Subject:</div>
                    <div className="font-medium">{emailContent.subject || "No subject"}</div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-muted-foreground">Content:</div>
                    <div className="whitespace-pre-wrap text-sm">
                      {emailContent.content || "No content"}
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This email will be sent to {selectedRecipients.size} recipient{selectedRecipients.size !== 1 ? 's' : ''}. 
                    Each recipient will receive a personalized version with their specific information.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingCampaign(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCampaign}
              disabled={selectedRecipients.size === 0 || !emailContent.subject.trim() || !emailContent.content.trim()}
            >
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Dialog */}
      {currentCampaign && (
        <Dialog open={!!currentCampaign} onOpenChange={() => setCurrentCampaign(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentCampaign.name}</DialogTitle>
              <DialogDescription>
                Campaign details and recipient list
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{currentCampaign.stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 bg-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{currentCampaign.stats.sent}</div>
                  <div className="text-sm text-green-600">Sent</div>
                </div>
                <div className="text-center p-3 bg-red-100 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{currentCampaign.stats.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="text-center p-3 bg-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{currentCampaign.stats.pending}</div>
                  <div className="text-sm text-blue-600">Pending</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Subject:</h4>
                <div className="p-3 bg-muted/30 rounded-lg">{currentCampaign.subject}</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Content:</h4>
                <div className="p-3 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm">
                  {currentCampaign.content}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recipients:</h4>
                <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCampaign.recipients?.map((recipient) => (
                        <TableRow key={recipient.id}>
                          <TableCell className="font-medium">{recipient.name}</TableCell>
                          <TableCell>{recipient.email}</TableCell>
                          <TableCell>{recipient.platform}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Pending</Badge>
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No recipients found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCurrentCampaign(null)}>
                Close
              </Button>
              {currentCampaign.status === 'draft' && (
                <Button onClick={() => handleSendCampaign(currentCampaign)} disabled={isSending}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Campaign
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Recipients Management Dialog */}
      <Dialog open={showRecipients} onOpenChange={setShowRecipients}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Recipients</DialogTitle>
            <DialogDescription>
              Add, edit, or remove email recipients
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {recipients.length} total recipients
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </div>

            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium">{recipient.name}</TableCell>
                      <TableCell>{recipient.email}</TableCell>
                      <TableCell>{recipient.platform}</TableCell>
                      <TableCell>{recipient.followers?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{recipient.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecipients(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
