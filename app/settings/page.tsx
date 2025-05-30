"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink, Save, AlertCircle, CheckCircle, ArrowLeft, Mail, Link } from 'lucide-react'
import { useRouter } from 'next/navigation'
import LS from '@/app/service/LS'
import { gmailService } from '@/lib/gmail'

interface UserSettings {
  name: string
  email: string
  googleClientId?: string
  googleApiKey?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    googleClientId: '',
    googleApiKey: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [credentialsStatus, setCredentialsStatus] = useState({
    hasEnvVars: false,
    hasDbCredentials: false,
    hasAnyCredentials: false
  })

  useEffect(() => {
    loadUserSettings()
    checkCredentialsStatus()
  }, [])

  const checkCredentialsStatus = () => {
    const status = gmailService.getCredentialsStatus()
    setCredentialsStatus(status)
  }

  const loadUserSettings = async () => {
    try {
      setIsLoading(true)
      const userId = LS.getUserId()
      
      if (!userId) {
        throw new Error('No user ID available')
      }

      const response = await fetch(`/api/auth/user?userId=${userId}`)

      if (!response.ok) {
        throw new Error('Failed to load settings')
      }

      const data = await response.json()
      setSettings({
        name: data.name || '',
        email: data.email || '',
        googleClientId: data.googleClientId || '',
        googleApiKey: data.googleApiKey || ''
      })
    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
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
          name: settings.name,
          googleClientId: settings.googleClientId,
          googleApiKey: settings.googleApiKey
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      // Refresh the Gmail service with new credentials
      await gmailService.refreshCredentials()
      checkCredentialsStatus()

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof UserSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    // Clear message when user starts typing
    if (message) {
      setMessage(null)
    }
  }

  const hasGmailCredentials = settings.googleClientId && settings.googleApiKey

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed from this interface
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gmail Integration Settings */}
          <Card className={hasGmailCredentials ? "border-green-200 bg-green-50/30" : "border-orange-200 bg-orange-50/30"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Gmail Integration
                {credentialsStatus.hasEnvVars && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ENV CONFIGURED</span>
                )}
                {hasGmailCredentials && !credentialsStatus.hasEnvVars && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">DB CONFIGURED</span>
                )}
              </CardTitle>
              <CardDescription>
                Configure Gmail API credentials to enable email features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {credentialsStatus.hasEnvVars ? (
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-blue-700">
                    Gmail API credentials are configured via environment variables. Individual credential settings are disabled.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {!hasGmailCredentials && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-orange-700">
                        Gmail integration is not configured. Add your credentials below to enable email features.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <label htmlFor="clientId" className="block text-sm font-medium mb-2">
                      Google Client ID
                    </label>
                    <Input
                      id="clientId"
                      value={settings.googleClientId}
                      onChange={(e) => handleInputChange('googleClientId', e.target.value)}
                      placeholder="your-client-id.apps.googleusercontent.com"
                      disabled={credentialsStatus.hasEnvVars}
                    />
                  </div>

                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                      Google API Key
                    </label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={settings.googleApiKey}
                      onChange={(e) => handleInputChange('googleApiKey', e.target.value)}
                      placeholder="Your Google API Key"
                      disabled={credentialsStatus.hasEnvVars}
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Need help setting up Gmail API?</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://developers.google.com/workspace/gmail/api/quickstart/js', '_blank')}
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Setup Guide
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveSettings} 
              disabled={isSaving || credentialsStatus.hasEnvVars}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 