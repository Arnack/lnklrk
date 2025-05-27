"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Edit, Plus, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface Note {
  id: string
  content: string
  date: string
}

interface NotesSectionProps {
  notes: Note[]
  onUpdate: (notes: Note[]) => void
}

export function NotesSection({ notes, onUpdate }: NotesSectionProps) {
  const [newNote, setNewNote] = useState("")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isAddingNote, setIsAddingNote] = useState(false)

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: uuidv4(),
        content: newNote.trim(),
        date: new Date().toISOString(),
      }

      onUpdate([...notes, note])
      setNewNote("")
      setIsAddingNote(false)
    }
  }

  const handleUpdateNote = () => {
    if (editingNote && editingNote.content.trim()) {
      const updatedNotes = notes.map((note) => (note.id === editingNote.id ? editingNote : note))

      onUpdate(updatedNotes)
      setEditingNote(null)
    }
  }

  const handleDeleteNote = (id: string) => {
    onUpdate(notes.filter((note) => note.id !== id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Notes</CardTitle>
          <CardDescription>Keep track of important information</CardDescription>
        </div>
        <Button onClick={() => setIsAddingNote(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No notes added yet</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 border rounded-md hover:bg-muted/50">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-muted-foreground">{formatDate(note.date)}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingNote(note)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="whitespace-pre-wrap">{note.content}</div>
            </div>
          ))
        )}

        {/* Add Note Dialog */}
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>Add a new note about this influencer</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>Add Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Note Dialog */}
        <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>Update this note</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Enter your note here..."
                value={editingNote?.content || ""}
                onChange={(e) => setEditingNote(editingNote ? { ...editingNote, content: e.target.value } : null)}
                className="min-h-[150px]"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateNote}>Update Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
