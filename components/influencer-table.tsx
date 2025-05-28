"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Influencer } from "@/types/influencer"
import { Instagram, Youtube, Twitch, Twitter, Trash2, AlertTriangle, Loader2 } from "lucide-react"

interface InfluencerTableProps {
  influencers: Influencer[]
  onDelete: (ids: string[]) => void
}

export function InfluencerTable({ influencers, onDelete }: InfluencerTableProps) {
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Reset selected IDs when influencers change
  useEffect(() => {
    setSelectedIds([])
  }, [influencers])

  const rowVirtualizer = useVirtualizer({
    count: influencers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  })

  const handleRowClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      // If clicking on the checkbox, don't navigate
      if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
        return
      }
      router.push(`/influencers/${id}`)
    },
    [router],
  )

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(influencers.map((inf) => inf.id))
      } else {
        setSelectedIds([])
      }
    },
    [influencers],
  )

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }, [])

  const handleDelete = useCallback(() => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      onDelete(selectedIds)
      setShowDeleteDialog(false)
      setSelectedIds([])
    } catch (error) {
      console.error("Failed to delete influencers:", error)
      setDeleteError("An error occurred while deleting the influencers. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }, [selectedIds, onDelete])

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      case "twitch":
        return <Twitch className="h-4 w-4" />
      case "twitter":
      case "x":
        return <Twitter className="h-4 w-4" />
      default:
        return null
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  // Define column widths with fixed minimum widths for scrolling
  const columnWidths = {
    checkbox: "w-[50px] min-w-[50px]",
    handle: "w-[150px] min-w-[150px]",
    platform: "w-[120px] min-w-[120px]",
    followers: "w-[100px] min-w-[100px]",
    rate: "w-[90px] min-w-[90px]",
    category: "w-[200px] min-w-[200px]",
    engagement: "w-[110px] min-w-[110px]",
    demographics: "w-[150px] min-w-[150px]",
  }

  return (
    <div>
      {selectedIds.length > 0 && (
        <div className="flex justify-between items-center mb-4 p-2 bg-muted rounded-md">
          <div>
            <span className="font-medium">{selectedIds.length}</span> influencer(s) selected
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
          </Button>
        </div>
      )}

      <div ref={parentRef} className="border rounded-md overflow-auto h-[calc(100vh-280px)]">
        <Table className="relative min-w-[980px]">
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className={columnWidths.checkbox}>
                <Checkbox
                  checked={influencers.length > 0 && selectedIds.length === influencers.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className={columnWidths.handle}>Handle</TableHead>
              <TableHead className={columnWidths.platform}>Platform</TableHead>
              <TableHead className={columnWidths.followers}>Followers</TableHead>
              <TableHead className={columnWidths.rate}>Rate</TableHead>
              <TableHead className={columnWidths.category}>Category</TableHead>
              <TableHead className={columnWidths.engagement}>Engagement</TableHead>
              <TableHead className={columnWidths.demographics}>Demographics</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <tr style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative", marginTop: "0px" }} />
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const influencer = influencers[virtualRow.index]
              return (
                <TableRow
                  key={influencer.id}
                  className="absolute top-0 left-0 w-full cursor-pointer hover:bg-muted"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                    marginTop: "48px",
                  }}
                  onClick={(e) => handleRowClick(influencer.id, e)}
                >
                  <TableCell className={columnWidths.checkbox}>
                    <Checkbox
                      checked={selectedIds.includes(influencer.id)}
                      onCheckedChange={(checked) => handleSelectOne(influencer.id, !!checked)}
                      aria-label={`Select ${influencer.handle}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className={`font-medium ${columnWidths.handle}`}>{influencer.handle}</TableCell>
                  <TableCell className={columnWidths.platform}>
                    <div className="flex items-center gap-1">
                      {getPlatformIcon(influencer.platform)}
                      <span>{influencer.platform}</span>
                    </div>
                  </TableCell>
                  <TableCell className={columnWidths.followers}>{formatNumber(influencer.followers)}</TableCell>
                  <TableCell className={columnWidths.rate}>${influencer.rate}</TableCell>
                  <TableCell className={columnWidths.category}>
                    <div className="flex flex-wrap gap-1">
                      {influencer.categories.slice(0, 2).map((category, i) => (
                        <Badge key={i} variant="outline">
                          {category}
                        </Badge>
                      ))}
                      {influencer.categories.length > 2 && (
                        <Badge variant="outline">+{influencer.categories.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={columnWidths.engagement}>{influencer.engagementRate}%</TableCell>
                  <TableCell className={columnWidths.demographics}>
                    <div className="text-xs">
                      <div>{influencer.followersAge}</div>
                      <div>{influencer.followersSex}</div>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Influencers</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length} influencer(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
