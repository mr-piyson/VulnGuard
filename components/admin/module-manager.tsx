"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react"
import LessonManager from "./lesson-manager"
import { trpc } from "@/lib/trpc/client"

interface Module {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  content: string
  order: number
  duration: number
}

interface ModuleManagerProps {
  courseId: string
  modules: Module[]
}

export default function ModuleManager({ courseId, modules: initialModules }: ModuleManagerProps) {
  const [modules, setModules] = useState(initialModules)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [newModule, setNewModule] = useState({ title: "", description: "" })
  const [showNewForm, setShowNewForm] = useState(false)

  const createModule = trpc.admin.createModule.useMutation()
  const deleteModule = trpc.admin.deleteModule.useMutation()

  const handleCreateModule = async () => {
    try {
      const module = await createModule.mutateAsync({
        courseId,
        ...newModule,
        order: modules.length,
      })

      setModules([...modules, module as any])
      setNewModule({ title: "", description: "" })
      setShowNewForm(false)
    } catch (error) {
      console.error("Failed to create module:", error)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return

    try {
      await deleteModule.mutateAsync({ id: moduleId })
      setModules(modules.filter((m) => m.id !== moduleId))
    } catch (error) {
      console.error("Failed to delete module:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Modules</h2>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Module Title</Label>
              <Input
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                placeholder="e.g., Introduction to Authentication"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                placeholder="Brief description of this module..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateModule}>Create Module</Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {modules.map((module, index) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    {module.title}
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  >
                    {expandedModule === module.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteModule(module.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedModule === module.id && (
              <CardContent>
                <LessonManager moduleId={module.id} lessons={module.lessons} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
