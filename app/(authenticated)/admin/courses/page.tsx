import { prisma } from "@/lib/db"
import AdminCourseList from "@/components/admin/admin-course-list"

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      modules: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return <AdminCourseList courses={courses} />
}
