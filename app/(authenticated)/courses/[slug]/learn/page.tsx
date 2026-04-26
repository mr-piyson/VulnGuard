import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import LearningInterface from "@/components/learning/learning-interface"

export default async function LearnPage({
  params,
  searchParams,
}: { params: { slug: string }; searchParams: { lesson?: string } }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/auth/signin")
  }

  const course = await prisma.course.findUnique({
    where: { slug: (await params).slug },
    include: {
      modules: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!course) {
    notFound()
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
  })

  if (!enrollment) {
    redirect(`/courses/${params.slug}`)
  }

  // Get all lessons with progress
  const allLessons = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleTitle: module.title,
      moduleId: module.id,
    })),
  )

  const progress = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: allLessons.map((l) => l.id) },
    },
  })

  const progressMap = new Map(progress.map((p) => [p.lessonId, p]))

  // Determine current lesson
  const lessonId = (await searchParams).lesson
  const currentLesson = lessonId ? allLessons.find((l) => l.id === lessonId) : allLessons[0]

  if (!currentLesson) {
    notFound()
  }

  const currentLessonProgress = progressMap.get(currentLesson.id)

  return (
    <LearningInterface
      course={course}
      modules={course.modules}
      currentLesson={currentLesson}
      allLessons={allLessons}
      progressMap={progressMap}
      userId={session.user.id}
      isCompleted={currentLessonProgress?.completed || false}
    />
  )
}
