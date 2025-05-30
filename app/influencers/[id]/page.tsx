"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileDetails } from "@/components/profile-details"
import { FileUploader } from "@/components/file-uploader"
import { NotesSection } from "@/components/notes-section"
import { MessageLog } from "@/components/message-log"
import { CampaignHistory } from "@/components/campaign-history"
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
import { fetchInfluencer, updateInfluencer, deleteInfluencer } from "@/lib/api"
import { ArrowLeft, Loader2, Trash2, AlertTriangle } from "lucide-react"

export default function InfluencerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [influencer, setInfluencer] = useState<Influencer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const loadInfluencer = async () => {
      setIsLoading(true)
      try {
        const data = await fetchInfluencer(params.id)
        setInfluencer(data)
      } catch (error) {
        console.error("Failed to load influencer:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInfluencer()
  }, [params.id])

  const handleProfileUpdate = async (updatedInfluencer: Influencer) => {
    try {
      const updated = await updateInfluencer(updatedInfluencer.id, updatedInfluencer)
      setInfluencer(updated)
    } catch (error) {
      console.error("Failed to update influencer:", error)
    }
  }

  const handleDeleteInfluencer = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteInfluencer(params.id)
      // Close dialog and redirect to dashboard
      setShowDeleteDialog(false)
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to delete influencer:", error)
      setDeleteError("An error occurred while deleting the influencer. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!influencer) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="mt-8 text-center">
          <h1 className="text-2xl font-bold">Influencer Not Found</h1>
          <p className="mt-2 text-muted-foreground">The influencer you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{influencer.handle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Influencer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-5 h-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileDetails influencer={influencer} onUpdate={handleProfileUpdate} />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FileUploader
            influencerId={influencer.id}
            files={influencer.files || []}
            onUpdate={(files) => handleProfileUpdate({ ...influencer, files })}
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <NotesSection
            notes={influencer.notes || []}
            onUpdate={(notes) => handleProfileUpdate({ ...influencer, notes })}
          />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <MessageLog
            messages={influencer.messages || []}
            onUpdate={(messages) => handleProfileUpdate({ ...influencer, messages })}
            influencerEmail={influencer.email}
            influencerName={influencer.handle}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignHistory influencerId={influencer.id} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Influencer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {influencer.handle}? This action cannot be undone.
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
            <Button variant="destructive" onClick={handleDeleteInfluencer} disabled={isDeleting}>
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
