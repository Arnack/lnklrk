"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddInfluencerToCampaign } from "@/components/add-influencer-to-campaign"
import { InfluencerStatusManager } from "@/components/influencer-status-manager"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CampaignWithInfluencers, CampaignInfluencer } from "@/types/campaign"
import { Loader2, ArrowLeft, Users, DollarSign, Calendar, Star, ExternalLink, Edit, ChevronDown, ChevronUp } from "lucide-react"
import LS from "@/app/service/LS"

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [campaign, setCampaign] = useState<CampaignWithInfluencers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOverviewCards, setShowOverviewCards] = useState(false)

  useEffect(() => {
    fetchCampaign()
  }, [params.id])

  const fetchCampaign = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/campaigns/${params.id}`, {
        headers: {
          'x-user-id': LS.getUserId() || ''
        }
      })
      if (!response.ok) {
        if (response.status === 404) {
          setError('Campaign not found')
        } else {
          throw new Error('Failed to fetch campaign')
        }
        return
      }
      const data = await response.json()
      setCampaign(data)
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      setError('Failed to load campaign. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInfluencerAdded = (newInfluencer: CampaignInfluencer) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        influencers: [...campaign.influencers, newInfluencer],
      })
    }
  }

  const handleInfluencerUpdated = (updatedInfluencer: CampaignInfluencer) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        influencers: campaign.influencers.map(inf => 
          inf.id === updatedInfluencer.id ? updatedInfluencer : inf
        ),
      })
    }
  }

  const handleInfluencerRemoved = (influencerId: string) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        influencers: campaign.influencers.filter(inf => inf.influencerId !== influencerId),
      })
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

  const totalSpent = campaign?.influencers.reduce((sum, inf) => sum + (inf.rate || 0), 0) || 0
  const averageRating = campaign?.influencers.length 
    ? campaign.influencers.reduce((sum, inf) => sum + (inf.performanceRating || 0), 0) / campaign.influencers.length
    : 0

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={() => router.push("/campaigns")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Button>
        <div className="mt-8 text-center">
          <h1 className="text-2xl font-bold">Campaign Not Found</h1>
          <p className="mt-2 text-muted-foreground">{error || 'The campaign you\'re looking for doesn\'t exist.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/campaigns")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getCampaignStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
              {campaign.startDate && (
                <span className="text-sm text-muted-foreground">
                  {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowOverviewCards(!showOverviewCards)}
          className="flex items-center gap-2"
        >
          {showOverviewCards ? (
            <>
              Hide Overview <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show Overview <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Campaign Overview Cards */}
      {showOverviewCards && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Influencers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.influencers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(campaign.budget)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              {campaign.budget && (
                <p className="text-xs text-muted-foreground">
                  {((totalSpent / campaign.budget) * 100).toFixed(1)}% of budget
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">out of 5 stars</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaign.description && (
            <div>
              <h4 className="font-medium">Description</h4>
              <p className="text-muted-foreground">{campaign.description}</p>
            </div>
          )}
          {campaign.briefUrl && (
            <div>
              <h4 className="font-medium">Campaign Brief</h4>
              <a 
                href={campaign.briefUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View Brief <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          {campaign.notes && (
            <div>
              <h4 className="font-medium">Notes</h4>
              <p className="text-muted-foreground">{campaign.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Influencers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign Influencers</CardTitle>
              <CardDescription>
                Manage influencers assigned to this campaign
              </CardDescription>
            </div>
            <AddInfluencerToCampaign 
              campaignId={campaign.id} 
              onInfluencerAdded={handleInfluencerAdded}
            />
          </div>
        </CardHeader>
        <CardContent>
          {campaign.influencers.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold">No influencers assigned yet</h3>
              <p className="text-muted-foreground mt-2">
                Start by adding influencers to this campaign
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign.influencers.map((campaignInfluencer) => (
                  <TableRow key={campaignInfluencer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaignInfluencer.influencer?.handle}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaignInfluencer.influencer?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{campaignInfluencer.influencer?.platform}</TableCell>
                    <TableCell>
                      {campaignInfluencer.influencer?.followers?.toLocaleString()}
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/influencers/${campaignInfluencer.influencerId}`)}
                        >
                          View
                        </Button>
                        <InfluencerStatusManager
                          campaignInfluencer={campaignInfluencer}
                          onUpdate={handleInfluencerUpdated}
                          onRemove={() => handleInfluencerRemoved(campaignInfluencer.influencerId)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 