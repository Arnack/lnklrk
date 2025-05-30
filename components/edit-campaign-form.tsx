"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { Campaign } from "@/types/campaign"
import LS from "@/app/service/LS"
import { Edit, Loader2 } from "lucide-react"

interface EditCampaignFormProps {
  campaign: Campaign
  onCampaignUpdated: (campaign: Campaign) => void
}

interface CampaignFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  budget: string
  status: Campaign['status']
  briefUrl: string
  notes: string
}

export function EditCampaignForm({ campaign, onCampaignUpdated }: EditCampaignFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    status: "draft",
    briefUrl: "",
    notes: "",
  })

  // Initialize form data when campaign prop changes or dialog opens
  useEffect(() => {
    if (campaign && isOpen) {
      setFormData({
        name: campaign.name || "",
        description: campaign.description || "",
        startDate: campaign.startDate ? campaign.startDate.split('T')[0] : "",
        endDate: campaign.endDate ? campaign.endDate.split('T')[0] : "",
        budget: campaign.budget ? campaign.budget.toString() : "",
        status: campaign.status,
        briefUrl: campaign.briefUrl || "",
        notes: campaign.notes || "",
      })
    }
  }, [campaign, isOpen])

  const resetForm = () => {
    setFormData({
      name: campaign.name || "",
      description: campaign.description || "",
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : "",
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : "",
      budget: campaign.budget ? campaign.budget.toString() : "",
      status: campaign.status,
      briefUrl: campaign.briefUrl || "",
      notes: campaign.notes || "",
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError("Campaign name is required")
      return
    }

    const userId = LS.getUserId()
    if (!userId) {
      setError("You must be logged in to edit campaigns")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const campaignData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      }

      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        throw new Error('Failed to update campaign')
      }

      const updatedCampaign = await response.json()
      
      onCampaignUpdated(updatedCampaign)
      setIsOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to update campaign:", error)
      setError("Failed to update campaign. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update your campaign details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="Enter campaign name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your campaign goals and objectives"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Campaign['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="brief-url">Campaign Brief URL</Label>
              <Input
                id="brief-url"
                type="url"
                placeholder="https://..."
                value={formData.briefUrl}
                onChange={(e) => setFormData({ ...formData, briefUrl: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the campaign"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Campaign'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 