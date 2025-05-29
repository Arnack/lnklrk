"use client"

declare global {
  interface Window {
    gapi: any;
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
  direction: "incoming" | "outgoing"
  subject: string
  content: string
  date: string
  from: string
  to: string
}

class GmailService {
  private accessToken: string | null = null
  private isInitialized = false

  constructor() {
    this.loadGoogleAPI()
  }

  private async loadGoogleAPI() {
    if (typeof window === 'undefined') return

    // Load Google API script if not already loaded
    if (!window.gapi) {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        window.gapi.load('auth2', () => {
          this.initializeGoogleAuth()
        })
      }
      document.head.appendChild(script)
    } else {
      this.initializeGoogleAuth()
    }
  }

  private async initializeGoogleAuth() {
    try {
      await window.gapi.auth2.init({
        client_id: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID || '',
      })
      
      // Check if user is already signed in
      const authInstance = window.gapi.auth2.getAuthInstance()
      if (authInstance.isSignedIn.get()) {
        const currentUser = authInstance.currentUser.get()
        const authResponse = currentUser.getAuthResponse()
        this.accessToken = authResponse.access_token
        this.isInitialized = true
        
        // Store token for persistence
        if (this.accessToken) {
          localStorage.setItem('gmail_access_token', this.accessToken)
        }
      } else {
        // Try to load stored token
        const storedToken = localStorage.getItem('gmail_access_token')
        if (storedToken) {
          this.accessToken = storedToken
          this.isInitialized = true
        }
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error)
    }
  }

  async authenticate(): Promise<void> {
    if (typeof window === 'undefined') return

    return new Promise((resolve, reject) => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      const redirectUri = process.env.NEXT_PUBLIC_GMAIL_REDIRECT_URI

      console.log('clientId', clientId)
      console.log('redirectUri', redirectUri)
      
      if (!clientId || !redirectUri) {
        reject(new Error('Missing Gmail API configuration'))
        return
      }

      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send&` +
        `response_type=code&` +
        `access_type=offline`

      // Redirect to Google OAuth
      window.location.href = authUrl
    })
  }

  async setTokens(code: string) {
    try {
      const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
      const clientSecret = process.env.NEXT_PUBLIC_GMAIL_CLIENT_SECRET
      const redirectUri = process.env.NEXT_PUBLIC_GMAIL_REDIRECT_URI

      console.log('clientId setTokens >>>', clientId)
      console.log('clientSecret setTokens >>>', clientSecret)
      console.log('redirectUri setTokens >>>', redirectUri)
      
      if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Missing Gmail API configuration')
      }

      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      const tokens = await tokenResponse.json()
      
      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error)
      }

      this.accessToken = tokens.access_token
      this.isInitialized = true

      // Store tokens in localStorage for persistence
      if (this.accessToken) {
        localStorage.setItem('gmail_access_token', this.accessToken)
      }
      if (tokens.refresh_token) {
        localStorage.setItem('gmail_refresh_token', tokens.refresh_token)
      }

      return tokens
    } catch (error) {
      console.error('Error setting tokens:', error)
      throw error
    }
  }

  async loadStoredTokens(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    try {
      const storedToken = localStorage.getItem('gmail_access_token')
      if (storedToken) {
        this.accessToken = storedToken
        this.isInitialized = true
        return true
      }
    } catch (error) {
      console.error('Error loading stored tokens:', error)
    }
    return false
  }

  private async makeGmailRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshTokens()
        // Retry the request
        return this.makeGmailRequest(endpoint, options)
      }
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getEmailsWithContact(contactEmail: string, maxResults: number = 50): Promise<ParsedEmail[]> {
    if (!this.isInitialized) {
      throw new Error('Gmail service not authenticated')
    }

    try {
      // Search for emails with the specific contact
      const query = `from:${contactEmail} OR to:${contactEmail}`
      
      const response = await this.makeGmailRequest(
        `/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
      )

      if (!response.messages) {
        return []
      }

      // Get full message details
      const emails: ParsedEmail[] = []
      
      for (const message of response.messages) {
        try {
          const fullMessage = await this.makeGmailRequest(`/users/me/messages/${message.id}`)
          const parsedEmail = this.parseGmailMessage(fullMessage, contactEmail)
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
    if (!this.isInitialized) {
      throw new Error('Gmail service not authenticated')
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

      await this.makeGmailRequest('/users/me/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          raw: encodedEmail,
        }),
      })
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  async refreshTokens(): Promise<void> {
    const refreshToken = localStorage.getItem('gmail_refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
      const clientSecret = process.env.NEXT_PUBLIC_GMAIL_CLIENT_SECRET
      
      if (!clientId || !clientSecret) {
        throw new Error('Missing Gmail API configuration')
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        }),
      })

      const tokens = await response.json()
      
      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error)
      }

      this.accessToken = tokens.access_token
      if (this.accessToken) {
        localStorage.setItem('gmail_access_token', this.accessToken)
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error)
      // If refresh fails, clear stored tokens
      localStorage.removeItem('gmail_access_token')
      localStorage.removeItem('gmail_refresh_token')
      this.isInitialized = false
      throw error
    }
  }

  isAuthenticated(): boolean {
    return this.isInitialized && !!this.accessToken
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gmail_access_token')
      localStorage.removeItem('gmail_refresh_token')
    }
    this.accessToken = null
    this.isInitialized = false
  }
}

export const gmailService = new GmailService() 