"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ExternalLink, Settings, Link } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { gmailService } from '@/lib/gmail'
import LS from '@/app/service/LS'

interface GmailSetupAlertProps {
  onCredentialsSaved?: () => void
  showInlineForm?: boolean
}

export function GmailSetupAlert({ onCredentialsSaved, showInlineForm = false }: GmailSetupAlertProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [credentials, setCredentials] = useState({
    googleClientId: '',
    googleApiKey: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [credentialsStatus, setCredentialsStatus] = useState({
    hasEnvVars: false,
    hasDbCredentials: false,
    hasAnyCredentials: false
  })

  useEffect(() => {
    checkCredentialsStatus()
  }, [])

  const checkCredentialsStatus = () => {
    const status = gmailService.getCredentialsStatus()
    setCredentialsStatus(status)
  }

  const saveCredentials = async () => {
    try {
      setIsSaving(true)
      setMessage(null)
      const userId = LS.getUserId()
      
      if (!userId) {
        throw new Error('No user ID available')
      }

      const response = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          googleClientId: credentials.googleClientId,
          googleApiKey: credentials.googleApiKey
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save credentials')
      }

      // Refresh the Gmail service with new credentials
      await gmailService.refreshCredentials()
      
      setMessage({ type: 'success', text: 'Gmail credentials saved successfully!' })
      setShowForm(false)
      setCredentials({ googleClientId: '', googleApiKey: '' })
      
      // Refresh status
      checkCredentialsStatus()
      
      if (onCredentialsSaved) {
        onCredentialsSaved()
      }
    } catch (error) {
      console.error('Error saving credentials:', error)
      setMessage({ type: 'error', text: 'Failed to save Gmail credentials' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    // Clear message when user starts typing
    if (message) {
      setMessage(null)
    }
  }

  const handleGoToSettings = () => {
    router.push('/settings')
  }

  // If credentials are available, don't show the alert
  if (credentialsStatus.hasAnyCredentials) {
    return null
  }

  if (showInlineForm || showForm) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Configure Gmail Integration
          </CardTitle>
          <CardDescription className="text-orange-700">
            Add your Gmail API credentials to enable email features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <label htmlFor="clientId" className="block text-sm font-medium mb-2 text-orange-900">
              Google Client ID
            </label>
            <Input
              id="clientId"
              value={credentials.googleClientId}
              onChange={(e) => handleInputChange('googleClientId', e.target.value)}
              placeholder="your-client-id.apps.googleusercontent.com"
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2 text-orange-900">
              Google API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              value={credentials.googleApiKey}
              onChange={(e) => handleInputChange('googleApiKey', e.target.value)}
              placeholder="Your Google API Key"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-orange-100 rounded-lg">
            <Link className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-700">Need help setting up Gmail API?</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://developers.google.com/workspace/gmail/api/quickstart/js', '_blank')}
              className="text-orange-700 border-orange-300 hover:bg-orange-200"
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              Setup Guide
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={saveCredentials} 
              disabled={isSaving || !credentials.googleClientId || !credentials.googleApiKey}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Credentials'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowForm(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-orange-700">
        <div className="flex items-center justify-between">
          <div>
            <strong>Gmail integration not configured.</strong> Configure your Gmail API credentials to enable email features.
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://developers.google.com/workspace/gmail/api/quickstart/js', '_blank')}
              className="text-orange-700 border-orange-300 hover:bg-orange-200"
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              Setup Guide
            </Button>
            <Button
              size="sm"
              onClick={handleGoToSettings}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Settings className="mr-2 h-3 w-3" />
              Configure
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
} 