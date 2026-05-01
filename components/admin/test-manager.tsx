"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash, Edit2, Check, X, Award } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Markdown } from "@/components/ui/markdown"

interface Question {
  id: string
  question: string
  type: string
  options: string // JSON string
  correctAnswer: string
  explanation?: string | null
  points: number
  order: number
}

interface Test {
  id: string
  title: string
  description: string
  passingScore: number
  timeLimit: number | null
  questions: Question[]
}

interface TestManagerProps {
  courseId: string
  test: Test | null
}

export default function TestManager({ courseId, test: initialTest }: TestManagerProps) {
  const [test, setTest] = useState<Test | null>(initialTest)
  const [loading, setLoading] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    points: 1,
  })
  const [showNewForm, setShowNewForm] = useState(false)

  const createTest = trpc.admin.createTest.useMutation()
  const updateTest = trpc.admin.updateTest.useMutation()
  const addQuestion = trpc.admin.addQuestion.useMutation()
  const updateQuestion = trpc.admin.updateQuestion.useMutation()
  const deleteQuestion = trpc.admin.deleteQuestion.useMutation()

  const handleCreateTest = async () => {
    setLoading(true)
    try {
      const data = await createTest.mutateAsync({
        courseId,
        title: "Final Assessment",
        description: "Test your knowledge to earn a certificate",
        passingScore: 70,
        timeLimit: 30,
      })
      setTest(data as any)
      toast.success("Test created successfully")
    } catch (error) {
      console.error("Failed to create test:", error)
      toast.error("Failed to create test")
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!test) return
    setLoading(true)
    try {
      const question = await addQuestion.mutateAsync({
        testId: test.id,
        ...newQuestion,
        options: JSON.stringify(newQuestion.options.filter((o) => o.trim() !== "")),
        order: test.questions.length,
        type: "multiple-choice",
      })

      setTest({
        ...test,
        questions: [...test.questions, question as any],
      })
      setNewQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        points: 1,
      })
      setShowNewForm(false)
      toast.success("Question added")
    } catch (error) {
      console.error("Failed to add question:", error)
      toast.error("Failed to add question")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuestion = async (id: string, data: any) => {
    setLoading(true)
    try {
      const updated = await updateQuestion.mutateAsync({
        id,
        ...data,
        options: Array.isArray(data.options) ? JSON.stringify(data.options.filter((o: string) => o.trim() !== "")) : data.options,
      })

      if (test) {
        setTest({
          ...test,
          questions: test.questions.map((q) => (q.id === id ? { ...q, ...updated } : q)),
        })
      }
      setEditingQuestionId(null)
      toast.success("Question updated")
    } catch (error) {
      console.error("Failed to update question:", error)
      toast.error("Failed to update question")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!test || !confirm("Are you sure?")) return
    try {
      await deleteQuestion.mutateAsync({ id: questionId })
      setTest({
        ...test,
        questions: test.questions.filter((q) => q.id !== questionId),
      })
      toast.success("Question deleted")
    } catch (error) {
      console.error("Failed to delete question:", error)
      toast.error("Failed to delete question")
    }
  }

  const updateTestSettings = async (updates: { passingScore?: number; timeLimit?: number | null }) => {
    if (!test) return
    try {
      await updateTest.mutateAsync({
        id: test.id,
        ...updates,
      })
      toast.success("Settings saved")
    } catch (error) {
      console.error("Failed to update test settings:", error)
      toast.error("Failed to save settings")
    }
  }

  if (!test) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <CardTitle>No Assessment Found</CardTitle>
          <CardDescription>Courses need a final assessment for students to earn certificates.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleCreateTest} disabled={loading}>
            {loading ? "Creating..." : "Create Course Test"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Settings</CardTitle>
          <CardDescription>Adjust the passing score and time limit for the final assessment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Passing Score (%)</Label>
            <Input
              type="number"
              value={test.passingScore}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value)
                setTest({ ...test, passingScore: val })
              }}
              onBlur={() => updateTestSettings({ passingScore: test.passingScore })}
            />
          </div>
          <div className="space-y-2">
            <Label>Time Limit (minutes)</Label>
            <Input
              type="number"
              value={test.timeLimit || ""}
              onChange={(e) => {
                const val = e.target.value ? Number.parseInt(e.target.value) : null
                setTest({ ...test, timeLimit: val })
              }}
              onBlur={() => updateTestSettings({ timeLimit: test.timeLimit })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Questions ({test.questions.length})</h2>
          <p className="text-sm text-muted-foreground">Total points: {totalPoints}</p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {showNewForm && (
        <Card className="border-primary/50 shadow-lg">
          <CardHeader>
            <CardTitle>New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-3 space-y-2">
                <Tabs defaultValue="edit" className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Question Text</Label>
                    <TabsList className="h-8">
                      <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="edit" className="mt-0">
                    <Textarea
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      placeholder="Enter the question (Markdown supported)..."
                      className="min-h-[100px]"
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-md p-3 bg-muted/20 min-h-[100px]">
                      {newQuestion.question ? (
                        <Markdown content={newQuestion.question} className="prose-sm" />
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No content to preview</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: Number.parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Select one as correct</span>
              </div>
              {newQuestion.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...newQuestion.options]
                      newOpts[i] = e.target.value
                      setNewQuestion({ ...newQuestion, options: newOpts })
                    }}
                    placeholder={`Option ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant={newQuestion.correctAnswer === opt && opt !== "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: opt })}
                    className={newQuestion.correctAnswer === opt && opt !== "" ? "" : "bg-transparent"}
                  >
                    {newQuestion.correctAnswer === opt && opt !== "" ? <Check className="h-4 w-4" /> : "Set Correct"}
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Tabs defaultValue="edit" className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <Label>Explanation (Optional)</Label>
                  <TabsList className="h-8">
                    <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="edit" className="mt-0">
                  <Textarea
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                    placeholder="Explain why the answer is correct..."
                    rows={2}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="border rounded-md p-3 bg-muted/20 min-h-[60px]">
                    {newQuestion.explanation ? (
                      <Markdown content={newQuestion.explanation} className="prose-sm" />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No explanation to preview</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddQuestion} disabled={loading || !newQuestion.question || !newQuestion.correctAnswer}>
                Create Question
              </Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {test.questions.map((q, idx) => (
          <QuestionItem
            key={q.id}
            question={q}
            index={idx}
            isEditing={editingQuestionId === q.id}
            onEdit={() => setEditingQuestionId(q.id)}
            onCancel={() => setEditingQuestionId(null)}
            onDelete={() => handleDeleteQuestion(q.id)}
            onSave={(data:any) => handleUpdateQuestion(q.id, data)}
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}

function QuestionItem({ question, index, isEditing, onEdit, onCancel, onDelete, onSave, loading }: any) {
  const [editedData, setEditedData] = useState({
    question: question.question,
    options: JSON.parse(question.options),
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || "",
    points: question.points,
  })

  if (isEditing) {
    return (
      <Card className="border-primary shadow-md">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Edit Question {index + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
           <div className="grid gap-4 md:grid-cols-4">
               <div className="md:col-span-3 space-y-2">
                <Tabs defaultValue="edit" className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Question Text</Label>
                    <TabsList className="h-8">
                      <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="edit" className="mt-0">
                    <Textarea
                      value={editedData.question}
                      onChange={(e) => setEditedData({ ...editedData, question: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-md p-3 bg-muted/20 min-h-[100px]">
                      <Markdown content={editedData.question} className="prose-sm" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={editedData.points}
                  onChange={(e) => setEditedData({ ...editedData, points: Number.parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>

          <div className="space-y-3">
            <Label>Options</Label>
            {editedData.options.map((opt: string, i: number) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...editedData.options]
                    newOpts[i] = e.target.value
                    setEditedData({ ...editedData, options: newOpts })
                  }}
                />
                <Button
                  variant={editedData.correctAnswer === opt ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditedData({ ...editedData, correctAnswer: opt })}
                  className={editedData.correctAnswer === opt ? "" : "bg-transparent"}
                >
                  {editedData.correctAnswer === opt ? <Check className="h-4 w-4" /> : "Set Correct"}
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Tabs defaultValue="edit" className="w-full">
              <div className="flex items-center justify-between mb-2">
                <Label>Explanation</Label>
                <TabsList className="h-8">
                  <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="edit" className="mt-0">
                <Textarea
                  value={editedData.explanation}
                  onChange={(e) => setEditedData({ ...editedData, explanation: e.target.value })}
                  rows={2}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-0">
                <div className="border rounded-md p-3 bg-muted/20 min-h-[60px]">
                  {editedData.explanation ? (
                    <Markdown content={editedData.explanation} className="prose-sm" />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No explanation to preview</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => onSave(editedData)} disabled={loading}>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={onCancel} className="bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const options = JSON.parse(question.options)
  return (
    <Card className="group">
      <CardHeader className="py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-bold">Q{index + 1}</Badge>
              <Badge variant="secondary" className="text-[10px] font-bold capitalize">
                {question.type.replace("-", " ")}
              </Badge>
              <Badge variant="default" className="text-[10px] font-bold">
                {question.points} {question.points === 1 ? "point" : "points"}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">
              <Markdown content={question.question} className="prose-sm" />
            </CardTitle>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" onClick={onEdit} className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {options.map((opt: string, i: number) => (
            <div
              key={i}
              className={`p-2.5 rounded-lg border text-sm transition-colors ${
                opt === question.correctAnswer
                  ? "bg-primary/10 border-primary/40 font-medium"
                  : "bg-muted/30 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {opt === question.correctAnswer && <Check className="h-3.5 w-3.5 text-primary" />}
              </div>
            </div>
          ))}
        </div>
        {question.explanation && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg text-xs text-muted-foreground border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1 text-primary font-semibold">
              <Award className="h-3 w-3" />
              <span>Explanation</span>
            </div>
            <Markdown content={question.explanation} className="prose-sm" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
