"use client";

import { trpc } from "@/lib/trpc/client";
import EnrolledCourses from "@/components/dashboard/enrolled-courses";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: enrolledCourses, isLoading } = trpc.courses.getEnrolled.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <EnrolledCourses enrollments={enrolledCourses || []} userId="" />;
}
