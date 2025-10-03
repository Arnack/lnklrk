import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Recipient {
  id: string
  name: string
  email: string
  platform?: string
  followers?: number
  category?: string
  tags?: string[]
  customFields?: Record<string, string>
  type?: 'brand' | 'creator' | 'creator_agency' | 'brand_agency'
  tiktok?: boolean
  instagram?: boolean
  youtube?: boolean
  ugc?: boolean
  status?: string
  createdAt?: string
  updatedAt?: string
}

interface UseRecipientsOptions {
  userId?: string
  campaignId?: string
  autoFetch?: boolean
}

export function useRecipients(options: UseRecipientsOptions = {}) {
  const { userId, campaignId, autoFetch = true } = options
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch recipients
  const fetchRecipients = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/recipients?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipients')
      }

      const data = await response.json()
      setRecipients(data.recipients || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recipients'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Create recipient
  const createRecipient = async (recipientData: Omit<Recipient, 'id'> & { campaignId: string }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/recipients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recipientData,
          userId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create recipient')
      }

      const data = await response.json()
      setRecipients(prev => [data.recipient, ...prev])
      toast.success('Recipient created successfully!')
      
      return data.recipient
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create recipient'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Update recipient
  const updateRecipient = async (recipientId: string, updates: Partial<Recipient>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/recipients/${recipientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update recipient')
      }

      const data = await response.json()
      setRecipients(prev => 
        prev.map(recipient => 
          recipient.id === recipientId ? data.recipient : recipient
        )
      )
      toast.success('Recipient updated successfully!')
      
      return data.recipient
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update recipient'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Delete recipient
  const deleteRecipient = async (recipientId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/recipients/${recipientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete recipient')
      }

      setRecipients(prev => prev.filter(recipient => recipient.id !== recipientId))
      toast.success('Recipient deleted successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete recipient'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fetch recipients on mount
  useEffect(() => {
    if (autoFetch && userId) {
      fetchRecipients()
    }
  }, [userId, autoFetch])

  return {
    recipients,
    isLoading,
    error,
    fetchRecipients,
    createRecipient,
    updateRecipient,
    deleteRecipient,
  }
}
