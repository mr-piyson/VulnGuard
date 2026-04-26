import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import CourseGrid from "@/components/dashboard/course-grid"
import EnrolledCourses from "@/components/dashboard/enrolled-courses"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserManagement from "@/components/users/user-management"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/auth/signin")
  }

  const [allCourses, enrolledCourses] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      include: {
        modules: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    }),
  ])

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const canManageStudents = user?.role === "teacher" || user?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="my-courses" className="w-full">
          <TabsList className={`grid w-full ${canManageStudents ? 'max-w-xl grid-cols-3' : 'max-w-md grid-cols-2'}`}>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="browse">Browse Courses</TabsTrigger>
            {canManageStudents && <TabsTrigger value="students">Manage Students</TabsTrigger>}
          </TabsList>

          <TabsContent value="my-courses" className="mt-6">
            <EnrolledCourses enrollments={enrolledCourses} userId={session.user.id} />
          </TabsContent>

          <TabsContent value="browse" className="mt-6">
            <CourseGrid courses={allCourses} userId={session.user.id} />
          </TabsContent>

          {canManageStudents && (
            <TabsContent value="students" className="mt-6">
              <div className="bg-card border rounded-xl p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold">My Students</h2>
                  <p className="text-sm text-muted-foreground">Manage the students assigned to you.</p>
                </div>
                <UserManagement currentRole={user?.role || "student"} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
