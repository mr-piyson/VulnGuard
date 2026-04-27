"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash, Pencil, X, Check } from "lucide-react"
import { trpc } from "@/lib/trpc/client"

interface Lesson {
  id: string
  title: string
  content: string
  order: number
  duration: number
}

interface LessonManagerProps {
  moduleId: string
  lessons: Lesson[]
}

export default function LessonManager({ moduleId, lessons: initialLessons = [] }: LessonManagerProps) {
  const [lessons, setLessons] = useState(initialLessons || [])
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  
  const [newLesson, setNewLesson] = useState({
    title: "",
    content: "",
    duration: 10,
  })

  const [editForm, setEditForm] = useState<Partial<Lesson>>({})

  const createLesson = trpc.admin.createLesson.useMutation()
  const updateLesson = trpc.admin.updateLesson.useMutation()
  const deleteLesson = trpc.admin.deleteLesson.useMutation()

  const handleCreateLesson = async () => {
    try {
      const lesson = await createLesson.mutateAsync({
        moduleId,
        ...newLesson,
        order: lessons.length,
      })

      setLessons([...lessons, lesson as any])
      setNewLesson({ title: "", content: "", duration: 10 })
      setShowNewForm(false)
    } catch (error) {
      console.error("Failed to create lesson:", error)
    }
  }

  const handleStartEdit = (lesson: Lesson) => {
    setEditingLessonId(lesson.id)
    setEditForm(lesson)
    setShowNewForm(false)
  }

  const handleUpdateLesson = async () => {
    if (!editingLessonId) return
    try {
      const updated = await updateLesson.mutateAsync({
        id: editingLessonId,
        title: editForm.title,
        content: editForm.content,
        duration: editForm.duration,
      })
      
      setLessons(lessons.map(l => l.id === editingLessonId ? (updated as any) : l))
      setEditingLessonId(null)
      setEditForm({})
    } catch (error) {
      console.error("Failed to update lesson:", error)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    try {
      await deleteLesson.mutateAsync({ id: lessonId })
      setLessons(lessons.filter((l) => l.id !== lessonId))
    } catch (error) {
      console.error("Failed to delete lesson:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lessons ({lessons.length})</h3>
        <Button size="sm" onClick={() => {
          setShowNewForm(!showNewForm)
          setEditingLessonId(null)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {(showNewForm || editingLessonId) && (
        <Card className="bg-muted/50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">
              {editingLessonId ? `Edit Lesson: ${editForm.title}` : "New Lesson"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={editingLessonId ? editForm.title : newLesson.title}
                onChange={(e) => 
                  editingLessonId 
                    ? setEditForm({ ...editForm, title: e.target.value })
                    : setNewLesson({ ...newLesson, title: e.target.value })
                }
                placeholder="e.g., Password Hashing Basics"
              />
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown)</Label>
              <Textarea
                value={editingLessonId ? editForm.content : newLesson.content}
                onChange={(e) => 
                  editingLessonId 
                    ? setEditForm({ ...editForm, content: e.target.value })
                    : setNewLesson({ ...newLesson, content: e.target.value })
                }
                placeholder="Lesson content in markdown format..."
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={editingLessonId ? editForm.duration : newLesson.duration}
                onChange={(e) => 
                  editingLessonId 
                    ? setEditForm({ ...editForm, duration: Number.parseInt(e.target.value) })
                    : setNewLesson({ ...newLesson, duration: Number.parseInt(e.target.value) })
                }
                min="1"
              />
            </div>
            <div className="flex gap-2">
              {editingLessonId ? (
                <>
                  <Button size="sm" onClick={handleUpdateLesson}>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingLessonId(null)} className="bg-transparent">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" onClick={handleCreateLesson}>
                    Create Lesson
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNewForm(false)} className="bg-transparent">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">#{index + 1}</span>
                <span className="font-medium">{lesson.title}</span>
                <span className="text-sm text-muted-foreground">({lesson.duration} min)</span>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" onClick={() => handleStartEdit(lesson)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteLesson(lesson.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
