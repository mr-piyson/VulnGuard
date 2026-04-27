"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import CertificateView from "@/components/certificate/certificate-view";
import { Loader2 } from "lucide-react";

export default function CertificateClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);

  // 1. Fetch the course (this is a Query)
  const { data: course, isLoading: courseLoading } = trpc.courses.getBySlug.useQuery({ slug });

  // 2. Setup the mutation (this is a Mutation)
  const getOrCreateMutation = trpc.certificates.getOrCreate.useMutation({
    onError: (error) => {
      if (error.message === "Test not found for this course") {
        router.push(`/courses/${slug}`);
      } else if (error.message === "You must pass the test to earn a certificate") {
        router.push(`/courses/${slug}/test`);
      }
    },
  });

  // 3. Trigger the mutation once the course data is ready
  useEffect(() => {
    if (course?.id) {
      getOrCreateMutation.mutate({ courseId: course.id });
    }
  }, [course?.id]);

  // 4. Handle states
  if (courseLoading || !course || getOrCreateMutation.isPending || !getOrCreateMutation.data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <CertificateView certificate={getOrCreateMutation.data} course={course} user={getOrCreateMutation.data.user} />;
}
