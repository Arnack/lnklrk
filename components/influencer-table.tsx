"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
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
import { Instagram, Youtube, Twitch, Twitter, Trash2, AlertTriangle, Loader2, ChevronUp, ChevronDown } from "lucide-react"

interface InfluencerTableProps {
  influencers: Influencer[]
  onDelete: (ids: string[]) => void
}

type SortField = 'handle' | 'platform' | 'followers' | 'rate' | 'engagement_rate'
type SortDirection = 'asc' | 'desc' | null

export function InfluencerTable({ influencers, onDelete }: InfluencerTableProps) {
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Sort the influencers based on current sort state
  const sortedInfluencers = useMemo(() => {
    if (!sortField || !sortDirection) {
      return influencers
    }

    return [...influencers].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle string sorting (case insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1

      // Compare values
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [influencers, sortField, sortDirection])

  // Handle column header clicks for sorting
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField, sortDirection])

  // Get sort icon for column headers
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    if (sortDirection === 'asc') return <ChevronUp className="h-4 w-4" />
    if (sortDirection === 'desc') return <ChevronDown className="h-4 w-4" />
    return null
  }

  // Reset selected IDs when influencers change
  useEffect(() => {
    setSelectedIds([])
  }, [influencers])

  const rowVirtualizer = useVirtualizer({
    count: sortedInfluencers.length,
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
        setSelectedIds(sortedInfluencers.map((inf) => inf.id))
      } else {
        setSelectedIds([])
      }
    },
    [sortedInfluencers],
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
    checkbox: "50px",
    handle: "150px",
    platform: "120px",
    followers: "100px",
    rate: "90px",
    category: "180px",
    tags: "160px",
    engagement: "110px",
    demographics: "150px",
  }

  const gridCols = `${columnWidths.checkbox} ${columnWidths.handle} ${columnWidths.platform} ${columnWidths.followers} ${columnWidths.rate} ${columnWidths.category} ${columnWidths.tags} ${columnWidths.engagement} ${columnWidths.demographics}`

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
        <div className="min-w-[980px]">
          {/* Header */}
          <div 
            className="grid sticky top-0 bg-background z-10 border-b font-medium h-12 items-center px-4"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div className="flex justify-center">
              <Checkbox
                checked={sortedInfluencers.length > 0 && selectedIds.length === sortedInfluencers.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </div>
            <button 
              className="flex items-center gap-1 text-left hover:text-primary transition-colors"
              onClick={() => handleSort('handle')}
            >
              <span>Handle</span>
              {getSortIcon('handle')}
            </button>
            <button 
              className="flex items-center gap-1 text-left hover:text-primary transition-colors"
              onClick={() => handleSort('platform')}
            >
              <span>Platform</span>
              {getSortIcon('platform')}
            </button>
            <button 
              className="flex items-center gap-1 text-left hover:text-primary transition-colors"
              onClick={() => handleSort('followers')}
            >
              <span>Followers</span>
              {getSortIcon('followers')}
            </button>
            <button 
              className="flex items-center gap-1 text-left hover:text-primary transition-colors"
              onClick={() => handleSort('rate')}
            >
              <span>Rate</span>
              {getSortIcon('rate')}
            </button>
            <div>Category</div>
            <div>Tags</div>
            <button 
              className="flex items-center gap-1 text-left hover:text-primary transition-colors"
              onClick={() => handleSort('engagement_rate')}
            >
              <span>Engagement</span>
              {getSortIcon('engagement_rate')}
            </button>
            <div>Demographics</div>
          </div>

          {/* Virtual Content */}
          <div className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const influencer = sortedInfluencers[virtualRow.index]
              return (
                <div
                  key={influencer.id}
                  className="grid absolute top-0 left-0 w-full cursor-pointer hover:bg-muted h-[60px] items-center px-4 border-b"
                  style={{
                    gridTemplateColumns: gridCols,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={(e) => handleRowClick(influencer.id, e)}
                >
                  <div className="flex justify-center">
                    <Checkbox
                      checked={selectedIds.includes(influencer.id)}
                      onCheckedChange={(checked) => handleSelectOne(influencer.id, !!checked)}
                      aria-label={`Select ${influencer.handle}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="font-medium truncate pr-2">{influencer.handle}</div>
                  <div className="flex items-center gap-1 truncate pr-2">
                    {getPlatformIcon(influencer.platform)}
                    <span className="truncate">{influencer.platform}</span>
                  </div>
                  <div className="truncate pr-2">{formatNumber(influencer.followers)}</div>
                  <div className="truncate pr-2">${influencer.rate}</div>
                  <div className="pr-2">
                    <div className="flex flex-wrap gap-1">
                      {influencer.categories.slice(0, 2).map((category, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {influencer.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{influencer.categories.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="pr-2">
                    <div className="flex flex-wrap gap-1">
                      {influencer.tags && influencer.tags.length > 0 ? (
                        <>
                          {influencer.tags.slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="default" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {influencer.tags.length > 2 && (
                            <Badge variant="default" className="text-xs">+{influencer.tags.length - 2}</Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">No tags</span>
                      )}
                    </div>
                  </div>
                  <div className="truncate pr-2">{influencer.engagement_rate}%</div>
                  <div className="text-xs pr-2">
                    <div className="truncate">{influencer.followers_age}</div>
                    <div className="truncate">{influencer.followers_sex}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
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
