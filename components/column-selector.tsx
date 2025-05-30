"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings2 } from "lucide-react"

export type ColumnKey = 'handle' | 'platform' | 'followers' | 'rate' | 'category' | 'tags' | 'engagement' | 'demographics' | 'profile_link'

export interface ColumnConfig {
  key: ColumnKey
  label: string
  defaultVisible: boolean
}

const defaultColumns: ColumnConfig[] = [
  { key: 'handle', label: 'Handle', defaultVisible: true },
  { key: 'platform', label: 'Platform', defaultVisible: true },
  { key: 'followers', label: 'Followers', defaultVisible: true },
  { key: 'rate', label: 'Rate', defaultVisible: true },
  { key: 'category', label: 'Category', defaultVisible: true },
  { key: 'tags', label: 'Tags', defaultVisible: true },
  { key: 'engagement', label: 'Engagement', defaultVisible: true },
  { key: 'demographics', label: 'Demographics', defaultVisible: true },
  { key: 'profile_link', label: 'Profile Link', defaultVisible: false },
]

interface ColumnSelectorProps {
  visibleColumns: Record<ColumnKey, boolean>
  onColumnToggle: (column: ColumnKey, visible: boolean) => void
}

export function ColumnSelector({ visibleColumns, onColumnToggle }: ColumnSelectorProps) {
  const handleToggle = (column: ColumnKey, checked: boolean) => {
    onColumnToggle(column, checked)
  }

  const handleShowAll = () => {
    defaultColumns.forEach(col => {
      onColumnToggle(col.key, true)
    })
  }

  const handleHideAll = () => {
    defaultColumns.forEach(col => {
      onColumnToggle(col.key, false)
    })
  }

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Columns ({visibleCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1">
          <div className="flex gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleShowAll}
            >
              Show All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleHideAll}
            >
              Hide All
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {defaultColumns.map((column) => (
          <DropdownMenuItem
            key={column.key}
            className="flex items-center space-x-2 cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <Checkbox
              id={column.key}
              checked={visibleColumns[column.key]}
              onCheckedChange={(checked) => handleToggle(column.key, !!checked)}
            />
            <label
              htmlFor={column.key}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              {column.label}
            </label>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { defaultColumns } 