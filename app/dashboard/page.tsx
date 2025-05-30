"use client"

import { useEffect, useState, useCallback } from "react"
import { InfluencerTable } from "@/components/influencer-table"
import { FilterBar } from "@/components/filter-bar"
import { ImportExportButtons } from "@/components/import-export-buttons"
import { AddInfluencerForm } from "@/components/add-influencer-form"
import { ColumnSelector, type ColumnKey, defaultColumns } from "@/components/column-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Influencer } from "@/types/influencer"
import { fetchInfluencers, deleteInfluencer } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Initialize visible columns state
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(() => {
    const initial: Record<ColumnKey, boolean> = {} as Record<ColumnKey, boolean>
    defaultColumns.forEach(col => {
      initial[col.key] = col.defaultVisible
    })
    return initial
  })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchInfluencers()
        setInfluencers(data)
        setFilteredInfluencers(data)
      } catch (error) {
        console.error("Failed to load influencers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleFilterChange = useCallback((filtered: Influencer[]) => {
    setFilteredInfluencers(filtered)
  }, [])

  const handleDataUpdate = (newInfluencers: Influencer[]) => {
    setInfluencers(newInfluencers)
    setFilteredInfluencers(newInfluencers)
  }

  const handleInfluencerAdded = (newInfluencer: Influencer) => {
    setInfluencers(prev => [newInfluencer, ...prev])
    setFilteredInfluencers(prev => [newInfluencer, ...prev])
  }

  const handleDeleteInfluencers = async (ids: string[]) => {
    try {
      // Delete each influencer from the database
      await Promise.all(ids.map(id => deleteInfluencer(id)))

      // Update state to remove deleted influencers
      setInfluencers(prev => prev.filter(inf => !ids.includes(inf.id)))
      setFilteredInfluencers(prev => prev.filter(inf => !ids.includes(inf.id)))
    } catch (error) {
      console.error("Failed to delete influencers:", error)
      throw error
    }
  }

  const handleColumnToggle = useCallback((column: ColumnKey, visible: boolean) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: visible
    }))
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Influencer Dashboard</h1>
          <p className="text-muted-foreground">Manage your influencers and campaigns in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <ColumnSelector 
            visibleColumns={visibleColumns} 
            onColumnToggle={handleColumnToggle} 
          />
          <AddInfluencerForm onInfluencerAdded={handleInfluencerAdded} />
          <ImportExportButtons onDataUpdate={handleDataUpdate} />
        </div>
      </div>

      <FilterBar influencers={influencers} onFilterChange={handleFilterChange} />

      <InfluencerTable 
        influencers={filteredInfluencers} 
        onDelete={handleDeleteInfluencers}
        visibleColumns={visibleColumns}
      />
    </div>
  )
}
