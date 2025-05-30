"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { CampaignInfluencer } from "@/types/campaign"
import type { Influencer } from "@/types/influencer"
import { Plus, Loader2, Search } from "lucide-react"
import LS from "@/app/service/LS"

interface AddInfluencerToCampaignProps {
  campaignId: string
  onInfluencerAdded: (campaignInfluencer: CampaignInfluencer) => void
}

export function AddInfluencerToCampaign({ campaignId, onInfluencerAdded }: AddInfluencerToCampaignProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInfluencers, setIsLoadingInfluencers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  const [formData, setFormData] = useState({
    status: 'contacted' as CampaignInfluencer['status'],
    rate: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchInfluencers()
    }
  }, [isOpen])

  const fetchInfluencers = async () => {
    try {
      setIsLoadingInfluencers(true)
      const response = await fetch('/api/influencers', {
        headers: {
          'x-user-id': LS.getUserId() || '',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch influencers')
      }
      const data = await response.json()
      setInfluencers(data)
    } catch (error) {
      console.error('Failed to fetch influencers:', error)
      setError('Failed to load influencers. Please try again.')
    } finally {
      setIsLoadingInfluencers(false)
    }
  }

  const filteredInfluencers = influencers.filter(inf => 
    inf.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inf.email && inf.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedInfluencer) {
      setError("Please select an influencer")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/influencers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': LS.getUserId() || ''
        },
        body: JSON.stringify({
          influencerId: selectedInfluencer.id,
          status: formData.status,
          rate: formData.rate ? parseFloat(formData.rate) : undefined,
          notes: formData.notes || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add influencer to campaign')
      }

      const campaignInfluencer = await response.json()
      
      // Add influencer data to the response
      const enrichedCampaignInfluencer = {
        ...campaignInfluencer,
        influencer: {
          id: selectedInfluencer.id,
          handle: selectedInfluencer.handle,
          followers: selectedInfluencer.followers,
          email: selectedInfluencer.email,
          platform: selectedInfluencer.platform,
          profileLink: selectedInfluencer.profileLink || selectedInfluencer.profile_link,
        }
      }
      
      onInfluencerAdded(enrichedCampaignInfluencer)
      setIsOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to add influencer to campaign:", error)
      setError(error instanceof Error ? error.message : "Failed to add influencer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedInfluencer(null)
    setFormData({
      status: 'contacted',
      rate: '',
      notes: '',
    })
    setSearchQuery("")
    setError(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Influencer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Influencer to Campaign</DialogTitle>
          <DialogDescription>
            Select an influencer and set their campaign details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Influencer Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search influencers by handle or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoadingInfluencers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border rounded-md max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Select</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInfluencers.map((influencer) => (
                      <TableRow 
                        key={influencer.id}
                        className={selectedInfluencer?.id === influencer.id ? "bg-muted" : ""}
                      >
                        <TableCell>
                          <input
                            type="radio"
                            name="influencer"
                            checked={selectedInfluencer?.id === influencer.id}
                            onChange={() => setSelectedInfluencer(influencer)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{influencer.handle}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{influencer.platform}</Badge>
                        </TableCell>
                        <TableCell>{influencer.followers?.toLocaleString()}</TableCell>
                        <TableCell>{influencer.email || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredInfluencers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No influencers found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campaign Details */}
          {selectedInfluencer && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Campaign Details for {selectedInfluencer.handle}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as CampaignInfluencer['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="rate">Rate ($)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Additional notes about this collaboration"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedInfluencer}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Influencer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 