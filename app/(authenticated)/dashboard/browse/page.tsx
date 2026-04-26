import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import CourseGrid from "@/components/dashboard/course-grid"

export default async function BrowseCoursesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session) return null

  const allCourses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      modules: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Browse Courses</h2>
        <p className="text-muted-foreground text-sm">Discover new skills and expand your knowledge.</p>
      </div>
      <CourseGrid courses={allCourses} userId={session.user.id} />
    </div>
  )
}
