"use client";

import { use, useEffect, useState } from "react";
import TestInterface from "@/components/assessment/test-interface";
import { trpc } from "@/lib/trpc/client";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const { data: course, isLoading: courseLoading } = trpc.courses.getBySlug.useQuery({ slug });
  const { data: enrollmentStatus, isLoading: statusLoading } = trpc.courses.getEnrollmentStatus.useQuery({ courseId: course?.id || "" }, { enabled: !!course?.id && !!session });

  const [test, setTest] = useState<any>(null);
  const getOrCreateMutation = trpc.tests.getOrCreate.useMutation();
  const { data: previousResults, isLoading: resultsLoading, refetch: refetchResults } = trpc.tests.getResults.useQuery({ testId: test?.id || "" }, { enabled: !!test?.id });

  useEffect(() => {
    if (course?.id && session && enrollmentStatus?.isEnrolled && !test) {
      getOrCreateMutation.mutate(
        { courseId: course.id },
        {
          onSuccess: (data) => setTest(data),
        },
      );
    }
  }, [course, session, enrollmentStatus, test]);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/auth/signin");
    } else if (course && !courseLoading && enrollmentStatus && !statusLoading && !enrollmentStatus.isEnrolled) {
      router.push(`/courses/${slug}`);
    }
  }, [session, sessionLoading, course, courseLoading, enrollmentStatus, statusLoading, router, slug]);

  const isLoading = sessionLoading || courseLoading || statusLoading || (!!enrollmentStatus?.isEnrolled && !test) || (!!test && resultsLoading);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course || !test) {
    return null;
  }

  return <TestInterface course={course} test={test} previousResults={previousResults || []} userId={session?.user.id || ""} />;
}
