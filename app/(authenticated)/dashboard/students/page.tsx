import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import UserManagement from "@/components/users/user-management"
import { redirect } from "next/navigation"

export default async function StudentManagementPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== "teacher" && user?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">User Directory</h2>
        <p className="text-sm text-muted-foreground">Manage the teachers and students assigned to the platform.</p>
      </div>
      <UserManagement currentRole={user?.role || "student"} />
    </div>
  )
}
