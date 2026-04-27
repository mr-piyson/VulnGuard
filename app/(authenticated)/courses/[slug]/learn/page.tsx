"use client";

import { use, useMemo } from "react";
import LearningInterface from "@/components/learning/learning-interface";
import { trpc } from "@/lib/trpc/client";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

export default function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, isLoading: sessionLoading } = useSession();
  
  const { data: course, isLoading: courseLoading } = trpc.courses.getBySlug.useQuery({ slug });
  const { data: enrollmentStatus, isLoading: statusLoading } = trpc.courses.getEnrollmentStatus.useQuery(
    { courseId: course?.id || "" },
    { enabled: !!course?.id && !!session }
  );
  
  const { data: progress, isLoading: progressLoading } = trpc.courses.getCourseFullProgress.useQuery(
    { courseId: course?.id || "" },
    { enabled: !!course?.id && !!session }
  );

  const isLoading = sessionLoading || courseLoading || (!!session && !!course && (statusLoading || progressLoading));

  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        ...lesson,
        moduleTitle: module.title,
        moduleId: module.id,
      }))
    );
  }, [course]);

  const progressMap = useMemo(() => {
    if (!progress) return new Map();
    return new Map(progress.map((p) => [p.lessonId, p]));
  }, [progress]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course || !session || !enrollmentStatus?.isEnrolled) {
    if (!courseLoading && !course) {
       router.push("/dashboard");
       return null;
    }
    if (!sessionLoading && !session) {
        router.push("/auth/signin");
        return null;
    }
    if (!statusLoading && !enrollmentStatus?.isEnrolled) {
        router.push(`/courses/${slug}`);
        return null;
    }
    return null;
  }

  const lessonId = searchParams.get("lesson");
  const currentLesson = lessonId ? allLessons.find((l) => l.id === lessonId) : allLessons[0];

  if (!currentLesson) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <button onClick={() => router.push(`/courses/${slug}/learn`)} className="mt-4 text-primary underline">
          Back to first lesson
        </button>
      </div>
    );
  }

  const currentLessonProgress = progressMap.get(currentLesson.id);

  return (
    <LearningInterface
      course={course}
      modules={course.modules}
      currentLesson={currentLesson as any}
      allLessons={allLessons as any}
      progressMap={progressMap}
      userId={session.user.id}
      isCompleted={currentLessonProgress?.completed || false}
    />
  );
}
