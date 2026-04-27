import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const coursesRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        search: z.string().nullish(),
      }).optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 50;
      const { search } = input ?? {};

      const courses = await prisma.course.findMany({
        where: {
          isPublished: true,
          OR: search
            ? [
                { title: { contains: search } },
                { description: { contains: search } },
              ]
            : undefined,
        },
        include: {
          modules: true,
          _count: {
            select: { enrollments: true },
          },
        },
        take: limit + 1,
        orderBy: {
          createdAt: "desc",
        },
      });

      return courses;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      const user = session?.user;
      
      const course = await prisma.course.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          modules: {
            orderBy: {
              order: "asc",
            },
            include: {
              lessons: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      // If not published, only allow admin/teacher or maybe enrolled users
      if (!course.isPublished) {
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found",
          });
        }

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });

        if (dbUser?.role !== "admin" && dbUser?.role !== "teacher") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found",
          });
        }
      }

      return course;
    }),

  getEnrolled: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await prisma.enrollment.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }),

  getEnrollmentStatus: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input, ctx }) => {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: ctx.session.user.id,
            courseId: input.courseId,
          },
        },
      });
      return { isEnrolled: !!enrollment, enrollment };
    }),

  getLesson: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ input, ctx }) => {
      const lesson = await prisma.lesson.findUnique({
        where: { id: input.lessonId },
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }

      // Check if user is enrolled in the course
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: ctx.session.user.id,
            courseId: lesson.module.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not enrolled in this course",
        });
      }

      const progress = await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: ctx.session.user.id,
            lessonId: input.lessonId,
          },
        },
      });

      return { ...lesson, progress };
    }),

  getCourseFullProgress: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input, ctx }) => {
      const progress = await prisma.progress.findMany({
        where: {
          userId: ctx.session.user.id,
          lesson: {
            module: {
              courseId: input.courseId,
            },
          },
        },
      });
      return progress;
    }),
});
