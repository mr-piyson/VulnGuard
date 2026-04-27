"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Menu, Award } from "lucide-react"
import Link from "next/link"
import LessonContent from "./lesson-content"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { trpc } from "@/lib/trpc/client"

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  content: string
  codeExample?: string | null
  duration: number
  moduleTitle?: string
  moduleId: string
  videoUrl?: string | null
}

interface ProgressItem {
  lessonId: string
  completed: boolean
}

interface LearningInterfaceProps {
  course: {
    id: string
    title: string
    slug: string
  }
  modules: Module[]
  currentLesson: Lesson
  allLessons: Lesson[]
  progressMap: Map<string, ProgressItem>
  userId: string
  isCompleted: boolean
}

export default function LearningInterface({
  course,
  modules,
  currentLesson,
  allLessons,
  progressMap: initialProgressMap,
  isCompleted: initialCompleted,
}: LearningInterfaceProps) {
  const router = useRouter()
  const utils = trpc.useUtils();
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [progressMap, setProgressMap] = useState(initialProgressMap)
  const [marking, setMarking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  useEffect(() => {
    setProgressMap(initialProgressMap)
    setIsCompleted(initialCompleted)
  }, [initialProgressMap, initialCompleted])

  const updateProgress = trpc.progress.update.useMutation();

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id)
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null

  const completedCount = Array.from(progressMap.values()).filter((p) => p.completed).length
  const progressPercentage = Math.round((completedCount / allLessons.length) * 100)
  const allLessonsCompleted = completedCount === allLessons.length

  const handleMarkComplete = async () => {
    const newStatus = !isCompleted;
    setMarking(true)

    try {
      await updateProgress.mutateAsync({
        lessonId: currentLesson.id,
        completed: newStatus,
      });

      // Update local state for immediate feedback
      setIsCompleted(newStatus)
      const newMap = new Map(progressMap)
      newMap.set(currentLesson.id, { lessonId: currentLesson.id, completed: newStatus })
      setProgressMap(newMap)

      // Invalidate queries to sync with server
      utils.courses.getCourseFullProgress.invalidate({ courseId: course.id });
      utils.courses.getEnrolled.invalidate();
      utils.courses.getEnrollmentStatus.invalidate({ courseId: course.id });
      
      router.refresh()
    } catch (error) {
      console.error("Failed to update progress:", error)
    } finally {
      setMarking(false)
    }
  }

  const navigateToLesson = (lessonId: string) => {
    router.push(`/courses/${course.slug}/learn?lesson=${lessonId}`)
    setSidebarOpen(false)
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-bold text-lg mb-2">{course.title}</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} />
          <p className="text-xs text-muted-foreground">
            {completedCount} of {allLessons.length} lessons completed
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <div key={module.id}>
              <h3 className="font-semibold text-sm mb-2 text-muted-foreground">
                Module {moduleIndex + 1}: {module.title}
              </h3>
              <div className="space-y-1">
                {module.lessons.map((lesson) => {
                  const lessonProgress = progressMap.get(lesson.id)
                  const isActive = lesson.id === currentLesson.id

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigateToLesson(lesson.id)}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      {lessonProgress?.completed ? (
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                        <p className="text-xs opacity-80">{lesson.duration} min</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full bg-transparent">
            Exit Course
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div>
            <h1 className="font-semibold text-sm lg:text-base">{currentLesson.title}</h1>
            <p className="text-xs text-muted-foreground">{currentLesson.moduleTitle}</p>
          </div>
        </div>

        <Button
          onClick={handleMarkComplete}
          disabled={marking}
          variant={isCompleted ? "outline" : "default"}
          size="sm"
          className={isCompleted ? "bg-transparent" : ""}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            "Mark Complete"
          )}
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:block w-80 border-r border-border bg-card overflow-hidden">
          <SidebarContent />
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            <LessonContent lesson={currentLesson} />

            <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
              {prevLesson ? (
                <Button variant="outline" onClick={() => navigateToLesson(prevLesson.id)} className="bg-transparent">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Button onClick={() => navigateToLesson(nextLesson.id)}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : allLessonsCompleted ? (
                <Link href={`/courses/${course.slug}/test`}>
                  <Button>
                    <Award className="h-4 w-4 mr-2" />
                    Take Final Test
                  </Button>
                </Link>
              ) : (
                <Button disabled>Complete all lessons first</Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
