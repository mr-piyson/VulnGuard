"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit, Eye, BookOpen, Clock, Users as UsersIcon } from "lucide-react"

interface AdminCourseListProps {
  courses: any[]
}

export default function AdminCourseList({ courses }: AdminCourseListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create, edit, and publish your educational content.</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <Badge variant={course.isPublished ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider">
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-1 max-w-2xl">{course.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/courses/${course.slug}`} target="_blank">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary/60" />
                  <span>{course.duration} mins</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-primary/60" />
                  <span>{course.modules.length} Modules</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UsersIcon className="h-4 w-4 text-primary/60" />
                  <span>{course._count.enrollments} Enrolled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
