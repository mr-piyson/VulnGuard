"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, Award, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { trpc } from "@/lib/trpc/client"

interface Question {
  id: string
  question: string
  type: string
  options: string
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

interface TestResult {
  id: string
  score: number
  passed: boolean
  completedAt: Date
}

interface TestInterfaceProps {
  course: {
    id: string
    title: string
    slug: string
  }
  test: Test
  previousResults: TestResult[]
  userId: string
}

export default function TestInterface({ course, test, previousResults }: TestInterfaceProps) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean; feedback: any[] } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submitTest = trpc.tests.submit.useMutation();

  const bestResult =
    previousResults.length > 0
      ? previousResults.reduce((best, current) => (current.score > best.score ? current : best))
      : null

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      const data = await submitTest.mutateAsync({
        testId: test.id,
        answers,
      });

      setResult(data)
      setSubmitted(true)
      router.refresh()
    } catch (error) {
      console.error("Failed to submit test:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const answeredCount = Object.keys(answers).length
  const progressPercentage = (answeredCount / test.questions.length) * 100

  if (!started) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href={`/courses/${course.slug}/learn`}>
              <Button variant="ghost">← Back to Course</Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{test.title}</CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Questions</p>
                    <p className="text-2xl font-bold">{test.questions.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time Limit</p>
                    <p className="text-2xl font-bold">{test.timeLimit ? `${test.timeLimit} min` : "No limit"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Passing Score</p>
                    <p className="text-2xl font-bold">{test.passingScore}%</p>
                  </div>
                </div>

                {bestResult && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    {bestResult.passed ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Best Score</p>
                      <p className="text-2xl font-bold">{bestResult.score}%</p>
                    </div>
                  </div>
                )}
              </div>

              {previousResults.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have attempted this test {previousResults.length} time(s). You can retake it to improve your
                    score.
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={() => setStarted(true)} size="lg" className="w-full">
                {previousResults.length > 0 ? "Retake Test" : "Start Test"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl font-bold">Test Results</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className={result.passed ? "border-primary" : "border-destructive"}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {result.passed ? (
                  <CheckCircle className="h-16 w-16 text-primary" />
                ) : (
                  <XCircle className="h-16 w-16 text-destructive" />
                )}
              </div>
              <CardTitle className="text-3xl">{result.passed ? "Congratulations!" : "Keep Learning"}</CardTitle>
              <CardDescription>
                {result.passed
                  ? "You passed the test! You can now claim your certificate."
                  : "You didn't pass this time, but you can try again."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-5xl font-bold mb-2">{result.score}%</p>
                <p className="text-muted-foreground">Passing score: {test.passingScore}%</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Review Your Answers</h3>
                {result.feedback.map((item: any, index: number) => (
                  <Card key={index} className={item.correct ? "border-primary/50" : "border-destructive/50"}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">Question {index + 1}</CardTitle>
                        {item.correct ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <CardDescription>{item.question}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Your answer:</p>
                        <p className={item.correct ? "text-primary" : "text-destructive"}>{item.userAnswer}</p>
                      </div>
                      {!item.correct && (
                        <div>
                          <p className="text-sm font-medium">Correct answer:</p>
                          <p className="text-primary">{item.correctAnswer}</p>
                        </div>
                      )}
                      {item.explanation && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-sm text-muted-foreground">{item.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                {result.passed ? (
                  <Link href={`/courses/${course.slug}/certificate`} className="flex-1">
                    <Button size="lg" className="w-full">
                      <Award className="h-5 w-5 mr-2" />
                      Get Certificate
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" onClick={() => window.location.reload()} className="flex-1">
                    Try Again
                  </Button>
                )}
                <Link href="/dashboard" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full bg-transparent">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const question = test.questions[currentQuestion]
  const options = JSON.parse(question.options)

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col font-sans selection:bg-primary/30">
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                {test.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">{course.title}</p>
            </div>
            <div className="text-sm font-medium bg-slate-800 px-3 py-1 rounded-full border border-white/5">
              Question <span className="text-blue-400">{currentQuestion + 1}</span> of {test.questions.length}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Progress</span>
              <span className="text-[10px] font-bold text-blue-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                 style={{ width: `${progressPercentage}%` }}
               />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-slate-900/40 border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-2xl font-semibold leading-tight text-white">
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
                className="grid gap-3"
              >
                {options.map((option: string, index: number) => {
                  const isSelected = answers[question.id] === option
                  return (
                    <div
                      key={index}
                      onClick={() => handleAnswerChange(question.id, option)}
                      className={`
                        group flex items-center space-x-3 p-5 border rounded-xl transition-all duration-200 cursor-pointer
                        ${isSelected 
                          ? "bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/20" 
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"}
                      `}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} className="border-slate-600 text-blue-500" />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className={`text-base flex-1 cursor-pointer transition-colors ${isSelected ? "text-blue-200" : "text-slate-300"}`}
                      >
                        {option}
                      </Label>
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center transition-all
                        ${isSelected ? "bg-blue-500 scale-100" : "bg-white/5 scale-0 group-hover:scale-50"}
                      `}>
                         <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>
                  )
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-md py-6">
        <div className="container mx-auto px-4 max-w-3xl flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="text-slate-400 hover:text-white hover:bg-white/5"
          >
            Previous
          </Button>

          <div className="flex gap-3">
            {currentQuestion === test.questions.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                disabled={answeredCount < test.questions.length || submitting}
                className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 px-8"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : "Finish Assessment"}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
