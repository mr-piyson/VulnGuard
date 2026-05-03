"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc/client";

interface CourseFormProps {
  course?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: string;
    duration: number;
    isPublished: boolean;
  };
}

export default function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    title: course?.title || "",
    slug: course?.slug || "",
    description: course?.description || "",
    difficulty: course?.difficulty || "beginner",
    duration: course?.duration || 60,
    isPublished: course?.isPublished || false,
  });

  const createCourse = trpc.admin.createCourse.useMutation();
  const updateCourse = trpc.admin.updateCourse.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (course) {
        await updateCourse.mutateAsync({
          id: course.id,
          ...formData,
        });
      } else {
        await createCourse.mutateAsync(formData);
      }

      utils.admin.getCourseById.invalidate({ id: course?.id || "" });
      router.push("/admin/courses");
      router.refresh();
    } catch (error) {
      console.error("Failed to save course:", error);
    } finally {
      setLoading(false);
      utils.admin.getCourseById.invalidate({ id: course?.id || "" });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course ? "Edit Course" : "Create Course"}</CardTitle>
        <CardDescription>{course ? "Update course information" : "Add a new TeachNLearn course"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  title: e.target.value,
                  slug: generateSlug(e.target.value),
                });
              }}
              placeholder="e.g., Authentication and Identity Management"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., auth-identity"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
            />
            <Label htmlFor="published">Publish course (make visible to students)</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : course ? "Update Course" : "Create Course"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
