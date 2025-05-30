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
import { fetchInfluencers, createInfluencer } from "@/lib/api"
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
      const XLSX = await import("xlsx")
      const influencers = await fetchInfluencers()

      // Prepare data for export
      const exportData = influencers.map((inf) => ({
        Handle: inf.handle,
        "Profile Link": inf.profile_link,
        Followers: inf.followers,
        Email: inf.email || "",
        Rate: inf.rate,
        Category: inf.categories.join(", "),
        "Followers Age": inf.followers_age,
        "Followers Sex": inf.followers_sex,
        "Engagement Rate": inf.engagement_rate,
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

      // Import XLSX library
      const XLSX = await import("xlsx")

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
          // @ts-ignore
          const importedInfluencers: Omit<Influencer, 'id'>[] = jsonData.map((row: any) => ({
            handle: row.Handle || "",
            profile_link: row["Profile Link"] || "",
            followers: Number(row.Followers) || 0,
            email: row.Email || "",
            rate: Number(row.Rate) || 0,
            categories: row.Category ? row.Category.split(",").map((c: string) => c.trim()) : [],
            followers_age: row["Followers Age"] || "",
            followers_sex: row["Followers Sex"] || "",
            engagement_rate: Number(row["Engagement Rate"]) || 0,
            platform: row.Platform || "Instagram",
            notes: row.Note ? [{ id: uuidv4(), date: new Date().toISOString(), content: row.Note }] : [],
            files: [],
            messages: [],
            campaigns: [],
            brands_worked_with: row["Brands Worked With"]
              ? row["Brands Worked With"].split(",").map((b: string) => b.trim())
              : [],
          }))

          // Get existing influencers to check for duplicates
          const existingInfluencers = await fetchInfluencers()

          console.log('importedInfluencers >>>', importedInfluencers)
          console.log('existingInfluencers >>>', existingInfluencers)

          const existingProfileLinks = new Set(existingInfluencers.map(inf => inf.profile_link))

          // Filter out duplicates and create new influencers
          const newInfluencers = []
          for (const newInf of importedInfluencers) {
            if (!newInf.profile_link || !existingProfileLinks.has(newInf.profile_link)) {
              try {
                const created = await createInfluencer(newInf)
                newInfluencers.push(created)
              } catch (error) {
                console.error("Failed to create influencer:", error)
              }
            }
          }

          // Get updated list and update UI
          const updatedInfluencers = await fetchInfluencers()
          onDataUpdate(updatedInfluencers)

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

          {isImporting ?
            <div className="grid gap-4 py-4"> 
              Importing...
            </div>
          :
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
          </div>}

        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={handleExport} className="flex gap-2">
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  )
}
