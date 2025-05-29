"use client"

import { useState, useEffect, useCallback } from "react"
import { gmailService, type ParsedEmail } from "@/lib/gmail"

export interface UseGmailOptions {
  autoLoad?: boolean
}

export function useGmail(options: UseGmailOptions = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasTokens = await gmailService.loadStoredTokens()
        setIsAuthenticated(hasTokens)
      } catch (err) {
        console.error('Error checking Gmail auth:', err)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  const authenticate = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await gmailService.authenticate()
      // The authenticate method now redirects to Google OAuth
      // No need to handle the result here as it will redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    gmailService.logout()
    setIsAuthenticated(false)
    setError(null)
  }, [])

  const fetchEmails = useCallback(async (contactEmail: string, maxResults?: number): Promise<ParsedEmail[]> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated with Gmail')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const emails = await gmailService.getEmailsWithContact(contactEmail, maxResults)
      return emails
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emails'
      setError(errorMessage)
      
      // If error is due to invalid token, try to refresh
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('unauthorized')) {
        try {
          await gmailService.refreshTokens()
          // Retry the request
          const emails = await gmailService.getEmailsWithContact(contactEmail, maxResults)
          return emails
        } catch (refreshError) {
          // If refresh fails, user needs to re-authenticate
          setIsAuthenticated(false)
          throw new Error('Authentication expired. Please reconnect your Gmail account.')
        }
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const sendEmail = useCallback(async (to: string, subject: string, content: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated with Gmail')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      await gmailService.sendEmail(to, subject, content)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email'
      setError(errorMessage)
      
      // If error is due to invalid token, try to refresh
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('unauthorized')) {
        try {
          await gmailService.refreshTokens()
          // Retry the request
          await gmailService.sendEmail(to, subject, content)
        } catch (refreshError) {
          // If refresh fails, user needs to re-authenticate
          setIsAuthenticated(false)
          throw new Error('Authentication expired. Please reconnect your Gmail account.')
        }
      } else {
        throw err
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  return {
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    logout,
    fetchEmails,
    sendEmail,
  }
} 