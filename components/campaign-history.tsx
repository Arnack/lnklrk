"use client"

import { useState } from "react"
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
import { Plus, Edit, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface Campaign {
  id: string
  name: string
  startDate: string
  endDate?: string
  status: "planned" | "active" | "completed" | "cancelled"
  payment: number
  paymentStatus: "pending" | "partial" | "paid"
  performance?: {
    impressions?: number
    engagement?: number
    clicks?: number
    conversions?: number
  }
  notes?: string
}

interface CampaignHistoryProps {
  campaigns: Campaign[]
  onUpdate: (campaigns: Campaign[]) => void
}

export function CampaignHistory({ campaigns, onUpdate }: CampaignHistoryProps) {
  const [isAddingCampaign, setIsAddingCampaign] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [newCampaign, setNewCampaign] = useState<Omit<Campaign, "id">>({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    status: "planned",
    payment: 0,
    paymentStatus: "pending",
    performance: {
      impressions: 0,
      engagement: 0,
      clicks: 0,
      conversions: 0,
    },
    notes: "",
  })

  const handleAddCampaign = () => {
    if (newCampaign.name.trim()) {
      const campaign: Campaign = {
        id: uuidv4(),
        ...newCampaign,
      }

      onUpdate([...campaigns, campaign])
      setNewCampaign({
        name: "",
        startDate: new Date().toISOString().split("T")[0],
        status: "planned",
        payment: 0,
        paymentStatus: "pending",
        performance: {
          impressions: 0,
          engagement: 0,
          clicks: 0,
          conversions: 0,
        },
        notes: "",
      })
      setIsAddingCampaign(false)
    }
  }

  const handleUpdateCampaign = () => {
    if (editingCampaign && editingCampaign.name.trim()) {
      const updatedCampaigns = campaigns.map((campaign) =>
        campaign.id === editingCampaign.id ? editingCampaign : campaign,
      )

      onUpdate(updatedCampaigns)
      setEditingCampaign(null)
    }
  }

  const handleDeleteCampaign = (id: string) => {
    onUpdate(campaigns.filter((campaign) => campaign.id !== id))
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "planned":
        return <Badge variant="outline">Planned</Badge>
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        )
    }
  }

  const getPaymentStatusBadge = (status: Campaign["paymentStatus"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "partial":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Partial
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>Track campaigns and performance</CardDescription>
        </div>
        <Button onClick={() => setIsAddingCampaign(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Campaign
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No campaigns recorded yet</div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 border rounded-md hover:bg-muted/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-lg">{campaign.name}</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingCampaign(campaign)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCampaign(campaign.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>{formatDate(campaign.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date:</span>
                      <span>{formatDate(campaign.endDate)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment:</span>
                      <span>${campaign.payment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      {getPaymentStatusBadge(campaign.paymentStatus)}
                    </div>
                  </div>
                </div>

                {campaign.performance && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="p-2 bg-muted rounded-md">
                        <div className="text-muted-foreground text-xs">Impressions</div>
                        <div className="font-medium">{campaign.performance.impressions?.toLocaleString() || "N/A"}</div>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <div className="text-muted-foreground text-xs">Engagement</div>
                        <div className="font-medium">{campaign.performance.engagement?.toLocaleString() || "N/A"}</div>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <div className="text-muted-foreground text-xs">Clicks</div>
                        <div className="font-medium">{campaign.performance.clicks?.toLocaleString() || "N/A"}</div>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <div className="text-muted-foreground text-xs">Conversions</div>
                        <div className="font-medium">{campaign.performance.conversions?.toLocaleString() || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {campaign.notes && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-1">Notes</h4>
                    <div className="text-sm text-muted-foreground">{campaign.notes}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Campaign Dialog */}
        <Dialog open={isAddingCampaign} onOpenChange={setIsAddingCampaign}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Campaign</DialogTitle>
              <DialogDescription>Record a new campaign with this influencer</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="Enter campaign name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newCampaign.endDate || ""}
                    onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="campaign-status">Status</Label>
                  <Select
                    value={newCampaign.status}
                    onValueChange={(value: Campaign["status"]) => setNewCampaign({ ...newCampaign, status: value })}
                  >
                    <SelectTrigger id="campaign-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="payment-status">Payment Status</Label>
                  <Select
                    value={newCampaign.paymentStatus}
                    onValueChange={(value: Campaign["paymentStatus"]) =>
                      setNewCampaign({ ...newCampaign, paymentStatus: value })
                    }
                  >
                    <SelectTrigger id="payment-status">
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="payment-amount">Payment Amount ($)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  placeholder="0"
                  value={newCampaign.payment || ""}
                  onChange={(e) => setNewCampaign({ ...newCampaign, payment: Number(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Performance Metrics</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="impressions" className="text-xs">
                      Impressions
                    </Label>
                    <Input
                      id="impressions"
                      type="number"
                      placeholder="0"
                      value={newCampaign.performance?.impressions || ""}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          performance: {
                            ...newCampaign.performance,
                            impressions: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="engagement" className="text-xs">
                      Engagement
                    </Label>
                    <Input
                      id="engagement"
                      type="number"
                      placeholder="0"
                      value={newCampaign.performance?.engagement || ""}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          performance: {
                            ...newCampaign.performance,
                            engagement: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="clicks" className="text-xs">
                      Clicks
                    </Label>
                    <Input
                      id="clicks"
                      type="number"
                      placeholder="0"
                      value={newCampaign.performance?.clicks || ""}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          performance: {
                            ...newCampaign.performance,
                            clicks: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="conversions" className="text-xs">
                      Conversions
                    </Label>
                    <Input
                      id="conversions"
                      type="number"
                      placeholder="0"
                      value={newCampaign.performance?.conversions || ""}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          performance: {
                            ...newCampaign.performance,
                            conversions: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="campaign-notes">Notes</Label>
                <Textarea
                  id="campaign-notes"
                  placeholder="Add any additional notes about this campaign"
                  value={newCampaign.notes || ""}
                  onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingCampaign(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCampaign}>Add Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Campaign Dialog */}
        <Dialog open={!!editingCampaign} onOpenChange={(open) => !open && setEditingCampaign(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
              <DialogDescription>Update campaign details</DialogDescription>
            </DialogHeader>

            {editingCampaign && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-campaign-name">Campaign Name</Label>
                  <Input
                    id="edit-campaign-name"
                    placeholder="Enter campaign name"
                    value={editingCampaign.name}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-start-date">Start Date</Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={editingCampaign.startDate.split("T")[0]}
                      onChange={(e) => setEditingCampaign({ ...editingCampaign, startDate: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-end-date">End Date</Label>
                    <Input
                      id="edit-end-date"
                      type="date"
                      value={editingCampaign.endDate?.split("T")[0] || ""}
                      onChange={(e) => setEditingCampaign({ ...editingCampaign, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-campaign-status">Status</Label>
                    <Select
                      value={editingCampaign.status}
                      onValueChange={(value: Campaign["status"]) =>
                        setEditingCampaign({ ...editingCampaign, status: value })
                      }
                    >
                      <SelectTrigger id="edit-campaign-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-payment-status">Payment Status</Label>
                    <Select
                      value={editingCampaign.paymentStatus}
                      onValueChange={(value: Campaign["paymentStatus"]) =>
                        setEditingCampaign({ ...editingCampaign, paymentStatus: value })
                      }
                    >
                      <SelectTrigger id="edit-payment-status">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-payment-amount">Payment Amount ($)</Label>
                  <Input
                    id="edit-payment-amount"
                    type="number"
                    placeholder="0"
                    value={editingCampaign.payment || ""}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, payment: Number(e.target.value) })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Performance Metrics</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-impressions" className="text-xs">
                        Impressions
                      </Label>
                      <Input
                        id="edit-impressions"
                        type="number"
                        placeholder="0"
                        value={editingCampaign.performance?.impressions || ""}
                        onChange={(e) =>
                          setEditingCampaign({
                            ...editingCampaign,
                            performance: {
                              ...editingCampaign.performance,
                              impressions: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-engagement" className="text-xs">
                        Engagement
                      </Label>
                      <Input
                        id="edit-engagement"
                        type="number"
                        placeholder="0"
                        value={editingCampaign.performance?.engagement || ""}
                        onChange={(e) =>
                          setEditingCampaign({
                            ...editingCampaign,
                            performance: {
                              ...editingCampaign.performance,
                              engagement: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-clicks" className="text-xs">
                        Clicks
                      </Label>
                      <Input
                        id="edit-clicks"
                        type="number"
                        placeholder="0"
                        value={editingCampaign.performance?.clicks || ""}
                        onChange={(e) =>
                          setEditingCampaign({
                            ...editingCampaign,
                            performance: {
                              ...editingCampaign.performance,
                              clicks: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="edit-conversions" className="text-xs">
                        Conversions
                      </Label>
                      <Input
                        id="edit-conversions"
                        type="number"
                        placeholder="0"
                        value={editingCampaign.performance?.conversions || ""}
                        onChange={(e) =>
                          setEditingCampaign({
                            ...editingCampaign,
                            performance: {
                              ...editingCampaign.performance,
                              conversions: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-campaign-notes">Notes</Label>
                  <Textarea
                    id="edit-campaign-notes"
                    placeholder="Add any additional notes about this campaign"
                    value={editingCampaign.notes || ""}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, notes: e.target.value })}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCampaign(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCampaign}>Update Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
