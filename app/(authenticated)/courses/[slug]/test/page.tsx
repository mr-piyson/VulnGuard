import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import TestInterface from "@/components/assessment/test-interface"

export default async function TestPage({ params }: { params: { slug: string } }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/auth/signin")
  }

  const course = await prisma.course.findUnique({
    where: { slug: (await params).slug },
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

  // Get or create test for this course
  let test = await prisma.test.findFirst({
    where: { courseId: course.id },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  })

  // If no test exists, create a default one
  if (!test) {
    test = await prisma.test.create({
      data: {
        courseId: course.id,
        title: `${course.title} - Final Assessment`,
        description: "Test your knowledge of the course material",
        passingScore: 70,
        timeLimit: 30,
      },
      include: {
        questions: true,
      },
    })
  }

  // Check for previous attempts
  const previousResults = await prisma.testResult.findMany({
    where: {
      userId: session.user.id,
      testId: test.id,
    },
    orderBy: { completedAt: "desc" },
  })

  return <TestInterface course={course} test={test} previousResults={previousResults} userId={session.user.id} />
}
