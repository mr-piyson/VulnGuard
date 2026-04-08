"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash } from "lucide-react"
import { trpc } from "@/lib/trpc/client"

interface Question {
  id: string
  question: string
  type: string
  options: string // JSON string
  correctAnswer: string
  explanation?: string | null
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
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  })
  const [showNewForm, setShowNewForm] = useState(false)

  const createTest = trpc.admin.createTest.useMutation()
  const updateSettings = trpc.admin.updateTestSettings.useMutation()
  const addQuestion = trpc.admin.addQuestion.useMutation()
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
    } catch (error) {
      console.error("Failed to create test:", error)
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
      })
      setShowNewForm(false)
    } catch (error) {
      console.error("Failed to add question:", error)
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
    } catch (error) {
      console.error("Failed to delete question:", error)
    }
  }

  const updateTestSettings = async (updates: { passingScore?: number; timeLimit?: number | null }) => {
    if (!test) return
    try {
      await updateSettings.mutateAsync({
        courseId,
        ...updates,
      })
    } catch (error) {
      console.error("Failed to update test settings:", error)
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Settings</CardTitle>
          <CardDescription>Adjust the passing score and time limit for the final assessment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Passing Score (%)</Label>
            <Input
              type="number"
              value={test.passingScore}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value)
                setTest({ ...test, passingScore: val })
                updateTestSettings({ passingScore: val })
              }}
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
                updateTestSettings({ timeLimit: val })
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Questions ({test.questions.length})</h2>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {showNewForm && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                placeholder="Enter the question..."
              />
            </div>

            <div className="space-y-3">
              <Label>Options</Label>
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
                    variant={newQuestion.correctAnswer === opt && opt !== "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: opt })}
                    className={newQuestion.correctAnswer === opt && opt !== "" ? "" : "bg-transparent"}
                  >
                    Correct
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Explanation (Optional)</Label>
              <Textarea
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                placeholder="Explain why the answer is correct..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddQuestion} disabled={loading || !newQuestion.question || !newQuestion.correctAnswer}>
                Save Question
              </Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {test.questions.map((q, idx) => {
          const options = JSON.parse(q.options)
          return (
            <Card key={q.id}>
              <CardHeader className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">Q{idx + 1}</span>
                      <span className="text-sm px-2 py-0.5 bg-muted rounded uppercase text-xs font-bold tracking-wider">
                        {q.type}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{q.question}</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {options.map((opt: string, i: number) => (
                    <div
                      key={i}
                      className={`p-2 rounded border text-sm ${
                        opt === q.correctAnswer
                          ? "bg-primary/10 border-primary/50 font-medium"
                          : "bg-muted/30 border-transparent"
                      }`}
                    >
                      {opt}
                      {opt === q.correctAnswer && <span className="ml-2 text-[10px] text-primary font-bold">(CORRECT)</span>}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="mt-4 p-3 bg-muted/20 rounded text-xs text-muted-foreground border-l-2 border-primary/30">
                    <span className="font-bold mr-1">Explanation:</span>
                    {q.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
