import { prisma } from "@/lib/db"
import AdminOverview from "@/components/admin/admin-overview"

export default async function AdminDashboardPage() {
  const [coursesCount, usersCount, enrollmentsCount, certificatesCount] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.enrollment.count(),
    prisma.certificate.count()
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm">Monitor platform health and key business metrics.</p>
      </div>
      <AdminOverview stats={{
        coursesCount,
        usersCount,
        enrollmentsCount,
        certificatesCount
      }} />
    </div>
  )
}
