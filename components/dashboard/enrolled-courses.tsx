import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Award } from "lucide-react";
import Link from "next/link";

interface Enrollment {
  id: string;
  progress: number;
  enrolledAt: Date | string;
  completedAt: Date | string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    duration: number;
    modules: {
      id: string;
      lessons: unknown[];
    }[];
  };
}

interface EnrolledCoursesProps {
  enrollments: Enrollment[];
  userId: string;
}

export default function EnrolledCourses({ enrollments }: EnrolledCoursesProps) {
  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
        <p className="text-muted-foreground mb-6">Start learning by enrolling in a course</p>
        <Link href="/dashboard/browse">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }

  const totalLessons = (course: Enrollment["course"]) => {
    return course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">My Learning</h2>
        <p className="text-muted-foreground">Continue where you left off</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id}>
            <CardHeader>
              <CardTitle className="text-xl">{enrollment.course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{enrollment.course.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{enrollment.course.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{totalLessons(enrollment.course)} lessons</span>
                </div>
                {enrollment.completedAt && (
                  <div className="flex items-center gap-1 text-primary">
                    <Award className="h-4 w-4" />
                    <span>Completed</span>
                  </div>
                )}
              </div>

              <Link href={`/courses/${enrollment.course.slug}/learn`}>
                <Button className="w-full">{enrollment.progress === 0 ? "Start Course" : "Continue Learning"}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
