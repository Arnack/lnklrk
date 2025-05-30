"use client"

import { useState } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CampaignInfluencer } from "@/types/campaign"
import { Edit, Loader2, MoreHorizontal, Star, Trash2 } from "lucide-react"

interface InfluencerStatusManagerProps {
  campaignInfluencer: CampaignInfluencer
  onUpdate: (updatedInfluencer: CampaignInfluencer) => void
  onRemove: () => void
}

export function InfluencerStatusManager({ campaignInfluencer, onUpdate, onRemove }: InfluencerStatusManagerProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    status: campaignInfluencer.status,
    rate: campaignInfluencer.rate?.toString() || '',
    performanceRating: campaignInfluencer.performanceRating?.toString() || '0',
    notes: campaignInfluencer.notes || '',
  })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/campaigns/${campaignInfluencer.campaignId}/influencers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignInfluencerId: campaignInfluencer.id,
          status: formData.status,
          rate: formData.rate ? parseFloat(formData.rate) : undefined,
          performanceRating: formData.performanceRating && formData.performanceRating !== '0' ? parseInt(formData.performanceRating) : undefined,
          notes: formData.notes || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update influencer')
      }

      const updatedInfluencer = await response.json()
      onUpdate({
        ...updatedInfluencer,
        influencer: campaignInfluencer.influencer, // Preserve influencer data
      })
      setIsEditOpen(false)
    } catch (error) {
      console.error("Failed to update influencer:", error)
      setError(error instanceof Error ? error.message : "Failed to update influencer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/campaigns/${campaignInfluencer.campaignId}/influencers?influencerId=${campaignInfluencer.influencerId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove influencer')
      }

      onRemove()
      setIsRemoveOpen(false)
    } catch (error) {
      console.error("Failed to remove influencer:", error)
      setError(error instanceof Error ? error.message : "Failed to remove influencer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      status: campaignInfluencer.status,
      rate: campaignInfluencer.rate?.toString() || '',
      performanceRating: campaignInfluencer.performanceRating?.toString() || '0',
      notes: campaignInfluencer.notes || '',
    })
    setError(null)
  }

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsRemoveOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from Campaign
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Campaign Details</DialogTitle>
            <DialogDescription>
              Update status and details for {campaignInfluencer.influencer?.handle}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
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
                <Label htmlFor="edit-rate">Rate ($)</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-performance">Performance Rating (1-5)</Label>
                <Select
                  value={formData.performanceRating || "0"}
                  onValueChange={(value) => setFormData({ ...formData, performanceRating: value === "0" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No rating</SelectItem>
                    <SelectItem value="1">⭐ (1/5)</SelectItem>
                    <SelectItem value="2">⭐⭐ (2/5)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3/5)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4/5)</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5/5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  placeholder="Additional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Influencer from Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {campaignInfluencer.influencer?.handle} from this campaign? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 