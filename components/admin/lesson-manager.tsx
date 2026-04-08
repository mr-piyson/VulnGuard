"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash } from "lucide-react"
import { trpc } from "@/lib/trpc/client"

interface Lesson {
  id: string
  title: string
  content: string
  order: number
  duration: number
  codeExample?: string | null
}

interface LessonManagerProps {
  moduleId: string
  lessons: Lesson[]
}

export default function LessonManager({ moduleId, lessons: initialLessons }: LessonManagerProps) {
  const [lessons, setLessons] = useState(initialLessons)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newLesson, setNewLesson] = useState({
    title: "",
    content: "",
    duration: 10,
    codeExample: "",
  })

  const createLesson = trpc.admin.createLesson.useMutation()
  const deleteLesson = trpc.admin.deleteLesson.useMutation()

  const handleCreateLesson = async () => {
    try {
      const lesson = await createLesson.mutateAsync({
        moduleId,
        ...newLesson,
        order: lessons.length,
      })

      setLessons([...lessons, lesson as any])
      setNewLesson({ title: "", content: "", duration: 10, codeExample: "" })
      setShowNewForm(false)
    } catch (error) {
      console.error("Failed to create lesson:", error)
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
        <Button size="sm" onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {showNewForm && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">New Lesson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                placeholder="e.g., Password Hashing Basics"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={newLesson.content}
                onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                placeholder="Lesson content in markdown format..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Code Example (Optional)</Label>
              <Textarea
                value={newLesson.codeExample}
                onChange={(e) => setNewLesson({ ...newLesson, codeExample: e.target.value })}
                placeholder="// Add code examples here..."
                rows={4}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={newLesson.duration}
                onChange={(e) => setNewLesson({ ...newLesson, duration: Number.parseInt(e.target.value) })}
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateLesson}>
                Create Lesson
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewForm(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">#{index + 1}</span>
                <span className="font-medium">{lesson.title}</span>
                <span className="text-sm text-muted-foreground">({lesson.duration} min)</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => handleDeleteLesson(lesson.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
