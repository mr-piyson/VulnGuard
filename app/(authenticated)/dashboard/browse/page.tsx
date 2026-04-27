"use client";

import { trpc } from "@/lib/trpc/client";
import CourseGrid from "@/components/dashboard/course-grid";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function BrowseCoursesPage() {
  const { data: session } = useSession();
  const { data: allCourses, isLoading } = trpc.courses.getAll.useQuery();

  if (isLoading || !session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Browse Courses</h2>
        <p className="text-muted-foreground text-sm">Discover new skills and expand your knowledge.</p>
      </div>
      <CourseGrid courses={allCourses || []} userId={session.user.id} />
    </div>
  );
}
