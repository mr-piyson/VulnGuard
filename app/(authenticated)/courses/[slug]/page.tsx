import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Award, CheckCircle } from "lucide-react"
import Link from "next/link"
import EnrollButton from "@/components/courses/enroll-button"

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const session = await auth.api.getSession({ headers: await headers() })

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

  let enrollment = null
  if (session) {
    enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    })
  }

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="capitalize">
              {course.difficulty}
            </Badge>
            {enrollment && (
              <Badge variant="default" className="bg-primary">
                Enrolled
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{course.description}</p>

          <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{course.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>
                {course.modules.length} modules • {totalLessons} lessons
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span>Certificate upon completion</span>
            </div>
          </div>

          {session ? (
            enrollment ? (
              <Link href={`/courses/${course.slug}/learn`}>
                <Button size="lg">Continue Learning</Button>
              </Link>
            ) : (
              <EnrollButton courseId={course.id} />
            )
          ) : (
            <Link href="/auth/signin">
              <Button size="lg">Sign in to Enroll</Button>
            </Link>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Course Content</h2>

          {course.modules.map((module, index) => (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-muted-foreground">Module {index + 1}:</span>
                  {module.title}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{lesson.title}</span>
                      <span className="text-muted-foreground ml-auto">{lesson.duration} min</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          {enrollment && (
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Final Assessment
                </CardTitle>
                <CardDescription>
                  Complete the final assessment to earn your certificate
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <Link href={`/courses/${course.slug}/test`}>
                    <Button className="w-full">Start Final Assessment</Button>
                 </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
