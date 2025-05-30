"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, ExternalLink } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CampaignInfluencer } from "@/types/campaign"
import { Loader2 } from "lucide-react"

interface CampaignHistoryProps {
  influencerId: string
}

export function CampaignHistory({ influencerId }: CampaignHistoryProps) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<CampaignInfluencer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInfluencerCampaigns()
  }, [influencerId])

  const fetchInfluencerCampaigns = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/influencers/${influencerId}/campaigns`)
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Failed to fetch influencer campaigns:', error)
      setError('Failed to load campaigns. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: CampaignInfluencer['status']) => {
    switch (status) {
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'posted':
        return 'bg-green-100 text-green-800'
      case 'paid':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const renderStars = (rating?: number) => {
    if (!rating) return 'N/A'
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>View campaigns this influencer has participated in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign History</CardTitle>
        <CardDescription>
          View campaigns this influencer has participated in
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold">No campaigns yet</h3>
            <p className="text-muted-foreground mt-2">
              This influencer hasn't been assigned to any campaigns
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Campaign Status</TableHead>
                <TableHead>Collaboration Status</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaignInfluencer) => (
                <TableRow key={campaignInfluencer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaignInfluencer.campaign?.name}</div>
                      {campaignInfluencer.notes && (
                        <div className="text-sm text-muted-foreground">
                          {campaignInfluencer.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCampaignStatusColor(campaignInfluencer.campaign?.status || '')}>
                      {campaignInfluencer.campaign?.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaignInfluencer.status)}>
                      {campaignInfluencer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(campaignInfluencer.rate)}</TableCell>
                  <TableCell>
                    {renderStars(campaignInfluencer.performanceRating)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(campaignInfluencer.campaign?.startDate)}</div>
                      <div className="text-muted-foreground">
                        to {formatDate(campaignInfluencer.campaign?.endDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/campaigns/${campaignInfluencer.campaignId}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
