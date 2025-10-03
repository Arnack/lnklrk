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

interface UseMassEmailOptions {
  userId?: string
  autoFetch?: boolean
}

export function useMassEmail(options: UseMassEmailOptions = {}) {
  const { userId, autoFetch = true } = options
  const [campaigns, setCampaigns] = useState<MassEmailCampaign[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch campaigns
  const fetchCampaigns = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/mass-email?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaigns'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Create campaign
  const createCampaign = async (campaignData: {
    name: string
    subject: string
    content: string
    recipients: Recipient[]
    templateId?: string
    templateVariables?: Record<string, string>
  }) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/mass-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...campaignData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      const data = await response.json()
      setCampaigns(prev => [data.campaign, ...prev])
      toast.success('Campaign created successfully!')
      
      return data.campaign
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Update campaign
  const updateCampaign = async (campaignId: string, updates: Partial<MassEmailCampaign>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/mass-email/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update campaign')
      }

      const data = await response.json()
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId ? data.campaign : campaign
        )
      )
      toast.success('Campaign updated successfully!')
      
      return data.campaign
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update campaign'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Delete campaign
  const deleteCampaign = async (campaignId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/mass-email/${campaignId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId))
      toast.success('Campaign deleted successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Send campaign
  const sendCampaign = async (campaignId: string, gmailAccessToken: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/mass-email/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gmailAccessToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to send campaign')
      }

      const data = await response.json()
      
      // Update campaign status
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { 
                ...campaign, 
                status: 'sent' as const,
                stats: data.stats,
                sentAt: new Date().toISOString()
              }
            : campaign
        )
      )
      
      toast.success(`Campaign sent! ${data.stats.sent} successful, ${data.stats.failed} failed`)
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send campaign'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fetch campaigns on mount
  useEffect(() => {
    if (autoFetch && userId) {
      fetchCampaigns()
    }
  }, [userId, autoFetch])

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
  }
}
