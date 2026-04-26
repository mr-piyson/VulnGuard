import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import CourseForm from "@/components/admin/course-form"

export default async function NewCoursePage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/dashboard")
  }else {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (user?.role !== "admin") {
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Create New Course</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <CourseForm />
      </main>
    </div>
  )
}
