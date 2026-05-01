"use client";

import { Markdown } from "@/components/ui/markdown";

interface LessonContentProps {
  lesson: {
    title: string;
    content: string;
    codeExample?: string | null;
    duration: number;
  };
}

export default function LessonContent({ lesson }: LessonContentProps) {
  return (
    <div className="space-y-6">
      <Markdown content={lesson.content} />
    </div>
  );
}
