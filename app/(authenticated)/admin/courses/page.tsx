"use client";

import { trpc } from "@/lib/trpc/client";
import AdminCourseList from "@/components/admin/admin-course-list";
import { Loader2 } from "lucide-react";

export default function AdminCoursesPage() {
  const { data: courses, isLoading } = trpc.admin.getAllCourses.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AdminCourseList courses={courses || []} />;
}
