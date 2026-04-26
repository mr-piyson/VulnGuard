import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import EnrolledCourses from "@/components/dashboard/enrolled-courses";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return null; // Handled by layout

  const enrolledCourses = await prisma.enrollment.findMany({
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
  });

  return <EnrolledCourses enrollments={enrolledCourses} userId={session.user.id} />;
}
