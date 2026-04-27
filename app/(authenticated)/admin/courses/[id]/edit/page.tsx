"use client";

import { use, useEffect } from "react";
import CourseForm from "@/components/admin/course-form";
import ModuleManager from "@/components/admin/module-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestManager from "@/components/admin/test-manager";
import { trpc } from "@/lib/trpc/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const { data: user, isLoading: userLoading } = trpc.users.me.useQuery();
  const { data: course, isLoading: courseLoading } = trpc.admin.getCourseById.useQuery({ id });

  useEffect(() => {
    if (!userLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [user, userLoading, router]);

  if (userLoading || courseLoading || !user || user.role !== "admin" || !course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const test = course.test?.[0] || null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Edit Course: {course.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="content">Modules & Lessons</TabsTrigger>
            <TabsTrigger value="test">Final Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <CourseForm course={course} />
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <ModuleManager courseId={course.id} modules={course.modules} />
          </TabsContent>

          <TabsContent value="test" className="mt-6">
            <TestManager courseId={course.id} test={test} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
