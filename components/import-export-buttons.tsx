"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Influencer } from "@/types/influencer"
import { Download, Upload, AlertCircle } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface ImportExportButtonsProps {
  onDataUpdate: (influencers: Influencer[]) => void
}

export function ImportExportButtons({ onDataUpdate }: ImportExportButtonsProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = async () => {
    try {
      const localForage = (await import("localforage")).default
      const XLSX = await import("xlsx")

      const influencers = (await localForage.getItem<Influencer[]>("influencers")) || []

      // Prepare data for export
      const exportData = influencers.map((inf) => ({
        Handle: inf.handle,
        "Profile Link": inf.profileLink,
        Followers: inf.followers,
        Email: inf.email || "",
        Rate: inf.rate,
        Category: inf.categories.join(", "),
        "Followers Age": inf.followersAge,
        "Followers Sex": inf.followersSex,
        "Engagement Rate": inf.engagementRate,
        Note: inf.notes && inf.notes.length > 0 ? inf.notes[0].content : "",
        Platform: inf.platform,
      }))

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Influencers")

      // Generate Excel file and download
      XLSX.writeFile(workbook, "influencers.xlsx")
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsImporting(true)
    setImportError(null)

    try {
      const file = event.target.files?.[0]
      if (!file) {
        setIsImporting(false)
        return
      }

      // Import the libraries dynamically
      const [{ default: localForage }, XLSX] = await Promise.all([import("localforage"), import("xlsx")])

      // Read the Excel file
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          if (!e.target?.result) {
            throw new Error("Failed to read file")
          }

          const data = new Uint8Array(e.target.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })

          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[worksheetName]

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          // Transform to Influencer objects
          const importedInfluencers: Influencer[] = jsonData.map((row: any) => ({
            id: uuidv4(),
            handle: row.Handle || "",
            profileLink: row["Profile Link"] || "",
            followers: Number(row.Followers) || 0,
            email: row.Email || "",
            rate: Number(row.Rate) || 0,
            categories: row.Category ? row.Category.split(",").map((c: string) => c.trim()) : [],
            followersAge: row["Followers Age"] || "",
            followersSex: row["Followers Sex"] || "",
            engagementRate: Number(row["Engagement Rate"]) || 0,
            platform: row.Platform || "Instagram",
            notes: row.Note ? [{ id: uuidv4(), date: new Date().toISOString(), content: row.Note }] : [],
            files: [],
            messages: [],
            campaigns: [],
            brandsWorkedWith: row["Brands Worked With"]
              ? row["Brands Worked With"].split(",").map((b: string) => b.trim())
              : [],
          }))

          // Get existing influencers
          const existingInfluencers = (await localForage.getItem<Influencer[]>("influencers")) || []

          // Remove duplicates based on profile link
          const uniqueLinks = new Set()
          const mergedInfluencers = [...existingInfluencers]

          for (const newInf of importedInfluencers) {
            if (newInf.profileLink && !uniqueLinks.has(newInf.profileLink)) {
              // Check if this profile link already exists
              const existingIndex = mergedInfluencers.findIndex((inf) => inf.profileLink === newInf.profileLink)

              if (existingIndex >= 0) {
                // Update existing record
                mergedInfluencers[existingIndex] = {
                  ...mergedInfluencers[existingIndex],
                  ...newInf,
                  id: mergedInfluencers[existingIndex].id, // Keep original ID
                  notes: [...(mergedInfluencers[existingIndex].notes || []), ...(newInf.notes || [])],
                  files: [...(mergedInfluencers[existingIndex].files || [])],
                  messages: [...(mergedInfluencers[existingIndex].messages || [])],
                  campaigns: [...(mergedInfluencers[existingIndex].campaigns || [])],
                }
              } else {
                // Add new record
                mergedInfluencers.push(newInf)
                uniqueLinks.add(newInf.profileLink)
              }
            } else if (!newInf.profileLink) {
              // No profile link, just add as new
              mergedInfluencers.push(newInf)
            }
          }

          // Save to localForage
          await localForage.setItem("influencers", mergedInfluencers)

          // Update UI
          onDataUpdate(mergedInfluencers)

          // Reset file input
          event.target.value = ""
        } catch (error) {
          console.error("Import processing failed:", error)
          setImportError("Failed to process the Excel file. Please check the format.")
        } finally {
          setIsImporting(false)
        }
      }

      reader.onerror = () => {
        setImportError("Failed to read the file.")
        setIsImporting(false)
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error("Import failed:", error)
      setImportError("Import failed. Please try again.")
      setIsImporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Influencers</DialogTitle>
            <DialogDescription>
              Upload an Excel file with influencer data. The file should have columns for Handle, Profile Link,
              Followers, Email, Rate, Category, Followers Age, Followers Sex, Engagement Rate, and Note.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImport}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />

            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={isImporting}>
              {isImporting ? "Importing..." : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={handleExport} className="flex gap-2">
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  )
}
