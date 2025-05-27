"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { File, Trash2, Download, FileText, ImageIcon, FileArchive } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface FileData {
  id: string
  name: string
  type: string
  size: number
  data: string
  date: string
  description?: string
}

interface FileUploaderProps {
  influencerId: string
  files: FileData[]
  onUpdate: (files: FileData[]) => void
}

export function FileUploader({ influencerId, files, onUpdate }: FileUploaderProps) {
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Read file as data URL
      const reader = new FileReader()

      reader.onload = (event) => {
        const newFile: FileData = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target?.result as string,
          date: new Date().toISOString(),
          description: description,
        }

        onUpdate([...files, newFile])
        setDescription("")
        setIsUploading(false)

        // Reset file input
        e.target.value = ""
      }

      reader.onerror = () => {
        console.error("Error reading file")
        setIsUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("File upload failed:", error)
      setIsUploading(false)
    }
  }

  const handleDeleteFile = (id: string) => {
    onUpdate(files.filter((file) => file.id !== id))
  }

  const handleDownloadFile = (file: FileData) => {
    const link = document.createElement("a")
    link.href = file.data
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6" />
    } else if (fileType.includes("pdf")) {
      return <FileText className="h-6 w-6" />
    } else if (fileType.includes("zip") || fileType.includes("rar")) {
      return <FileArchive className="h-6 w-6" />
    } else {
      return <File className="h-6 w-6" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files & Documents</CardTitle>
        <CardDescription>Upload contracts, media kits, and other files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file-description">File Description (optional)</Label>
            <Input
              id="file-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for the file"
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file-upload">Upload File</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No files uploaded yet</div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  {file.type.startsWith("image/") ? (
                    <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={file.data || "/placeholder.svg"}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-left font-medium truncate max-w-full"
                          onClick={() => setSelectedFile(file)}
                        >
                          {file.name}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{selectedFile?.name}</DialogTitle>
                          <DialogDescription>
                            Uploaded on {selectedFile && formatDate(selectedFile.date)}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4">
                          {selectedFile?.type.startsWith("image/") ? (
                            <div className="max-h-[60vh] overflow-auto flex items-center justify-center">
                              <img
                                src={selectedFile.data || "/placeholder.svg"}
                                alt={selectedFile.name}
                                className="max-w-full h-auto"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-12 bg-muted rounded-md">
                              {getFileIcon(selectedFile?.type || "")}
                              <span className="ml-2">Preview not available</span>
                            </div>
                          )}
                        </div>

                        {selectedFile?.description && (
                          <div className="mt-4">
                            <h4 className="font-medium">Description</h4>
                            <p className="text-muted-foreground">{selectedFile.description}</p>
                          </div>
                        )}

                        <DialogFooter className="mt-4">
                          <Button variant="outline" onClick={() => handleDownloadFile(selectedFile!)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleDownloadFile(file)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
