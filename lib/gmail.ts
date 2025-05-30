"use client"

import LS from "@/app/service/LS"

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{
      name: string
      value: string
    }>
  }
  internalDate: string
}

export interface ParsedEmail {
  id: string
  direction: 'incoming' | 'outgoing'
  subject: string
  content: string
  date: string
  from: string
  to: string
}

interface CredentialsStatus {
  hasEnvVars: boolean
  hasDbCredentials: boolean
  hasAnyCredentials: boolean
}

class GmailService {
  private tokenClient: any
  private gapiInited = false
  private gisInited = false
  private _isAuthenticated = false
  private credentials: { googleClientId?: string; googleApiKey?: string } = {}

  constructor() {
    this.loadGoogleAPIs()
  }

  async loadCredentials(): Promise<void> {
    // First check environment variables
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      this.credentials = {
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        googleApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
      }
      return
    }

    // If no env vars, try to get from database
    try {
      const userId = LS.getUserId()
      if (!userId) {
        console.log('No user ID available for credentials lookup')
        return
      }

      const response = await fetch(`/api/auth/user?userId=${userId}`)
      if (response.ok) {
        const userData = await response.json()
        if (userData.googleClientId && userData.googleApiKey) {
          this.credentials = {
            googleClientId: userData.googleClientId,
            googleApiKey: userData.googleApiKey
          }
        }
      }
    } catch (error) {
      console.error('Failed to load credentials from database:', error)
    }
  }

  getCredentialsStatus(): CredentialsStatus {
    const hasEnvVars = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
    const hasDbCredentials = Boolean(this.credentials.googleClientId && this.credentials.googleApiKey)
    
    return {
      hasEnvVars,
      hasDbCredentials,
      hasAnyCredentials: hasEnvVars || hasDbCredentials
    }
  }

  async refreshCredentials(): Promise<void> {
    await this.loadCredentials()
    // Re-initialize if we got new credentials
    if (this.credentials.googleClientId && this.credentials.googleApiKey) {
      this.loadGoogleAPIs()
    }
  }

  private async loadGoogleAPIs() {
    if (typeof window === 'undefined') return

    // Load credentials first
    await this.loadCredentials()

    // Check if we have credentials before proceeding
    if (!this.credentials.googleClientId || !this.credentials.googleApiKey) {
      console.log('No Gmail API credentials available')
      return
    }

    // Load Google API script
    if (!window.gapi) {
      const gapiScript = document.createElement('script')
      gapiScript.src = 'https://apis.google.com/js/api.js'
      gapiScript.async = true
      gapiScript.defer = true
      gapiScript.onload = () => this.gapiLoaded()
      document.head.appendChild(gapiScript)
    } else {
      this.gapiLoaded()
    }

    // Load Google Identity Services script
    if (!window.google?.accounts) {
      const gisScript = document.createElement('script')
      gisScript.src = 'https://accounts.google.com/gsi/client'
      gisScript.async = true
      gisScript.defer = true
      gisScript.onload = () => this.gisLoaded()
      document.head.appendChild(gisScript)
    } else {
      this.gisLoaded()
    }
  }

  private gapiLoaded() {
    window.gapi.load('client', () => this.initializeGapiClient())
  }

  private async initializeGapiClient() {
    if (!this.credentials.googleApiKey) {
      console.error('No Google API Key available')
      return
    }

    await window.gapi.client.init({
      apiKey: this.credentials.googleApiKey,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
    })
    this.gapiInited = true
    this.maybeEnableAuth()
  }

  private gisLoaded() {
    if (!this.credentials.googleClientId) {
      console.error('No Google Client ID available')
      return
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.credentials.googleClientId,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
      callback: (resp: any) => {
        if (resp.error !== undefined) {
          throw new Error(resp.error)
        }
        this._isAuthenticated = true
        console.log('Authentication successful')
      },
    })
    this.gisInited = true
    this.maybeEnableAuth()
  }

  private maybeEnableAuth() {
    if (this.gapiInited && this.gisInited) {
      console.log('Gmail service ready for authentication')
    }
  }

  async authenticate(): Promise<void> {
    // Check if we have credentials first
    if (!this.credentials.googleClientId || !this.credentials.googleApiKey) {

      throw new Error('Gmail API credentials not configured. Please configure them in Settings.')
    }

    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Google Identity Services not loaded'))
        return
      }

      // Set up callback for this specific authentication request
      this.tokenClient.callback = (resp: any) => {
        if (resp.error !== undefined) {
          console.error('Authentication error:', resp.error)
          reject(new Error(resp.error))
          return
        }
        this._isAuthenticated = true
        console.log('Authentication successful')
        resolve()
      }

      try {
        if (window.gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent
          this.tokenClient.requestAccessToken({ prompt: 'consent' })
        } else {
          // Skip display of account chooser and consent dialog for an existing session
          this.tokenClient.requestAccessToken({ prompt: '' })
        }
      } catch (error) {
        console.error('Error during authentication:', error)
        reject(new Error('Failed to start authentication process'))
      }
    })
  }

  async getEmailsWithContact(contactEmail: string, maxResults: number = 50): Promise<ParsedEmail[]> {
    if (!this._isAuthenticated) {
      throw new Error('Not authenticated with Gmail')
    }

    try {
      const query = `from:${contactEmail} OR to:${contactEmail}`
      
      const response = await window.gapi.client.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults,
      })

      if (!response.result.messages) {
        return []
      }

      // Get full message details
      const emails: ParsedEmail[] = []
      
      for (const message of response.result.messages) {
        try {
          const fullMessage = await window.gapi.client.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
          })

          const parsedEmail = this.parseGmailMessage(fullMessage.result, contactEmail)
          if (parsedEmail) {
            emails.push(parsedEmail)
          }
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error)
        }
      }

      // Sort by date (newest first)
      return emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
      console.error('Error fetching emails:', error)
      throw error
    }
  }

  private parseGmailMessage(message: any, contactEmail: string): ParsedEmail | null {
    try {
      const headers = message.payload.headers
      const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

      const from = getHeader('From')
      const to = getHeader('To')
      const subject = getHeader('Subject')
      const date = new Date(parseInt(message.internalDate)).toISOString()

      // Determine direction based on who sent the email
      const direction = from.toLowerCase().includes(contactEmail.toLowerCase()) ? 'incoming' : 'outgoing'

      // Extract email content
      let content = ''
      if (message.payload.body?.data) {
        content = this.decodeBase64(message.payload.body.data)
      } else if (message.payload.parts) {
        // Handle multipart messages
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            content = this.decodeBase64(part.body.data)
            break
          }
        }
      }

      // Fallback to snippet if no content found
      if (!content) {
        content = message.snippet || ''
      }

      return {
        id: message.id,
        direction,
        subject: subject || '(No Subject)',
        content: content.trim(),
        date,
        from: from,
        to: to,
      }
    } catch (error) {
      console.error('Error parsing Gmail message:', error)
      return null
    }
  }

  private decodeBase64(data: string): string {
    try {
      // Gmail uses URL-safe base64 encoding
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
      return decodeURIComponent(escape(atob(base64)))
    } catch (error) {
      console.error('Error decoding base64:', error)
      return ''
    }
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    if (!this._isAuthenticated) {
      throw new Error('Not authenticated with Gmail')
    }

    try {
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        content
      ].join('\n')

      const encodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      await window.gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: encodedEmail,
        },
      })
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated && window.gapi?.client?.getToken() !== null
  }

  logout(): void {
    const token = window.gapi?.client?.getToken()
    if (token !== null) {
      window.google?.accounts?.oauth2?.revoke(token.access_token)
      window.gapi?.client?.setToken('')
      this._isAuthenticated = false
    }
  }

  // Not needed with the new approach
  async setTokens(code: string) {
    throw new Error('setTokens not needed with Google Identity Services')
  }

  async loadStoredTokens(): Promise<boolean> {
    // GAPI handles token persistence automatically
    return this.isAuthenticated()
  }

  async refreshTokens(): Promise<void> {
    // GAPI handles token refresh automatically
    return
  }
}

export const gmailService = new GmailService() 