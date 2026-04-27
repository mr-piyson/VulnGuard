import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { prisma } from "@/lib/db";

export const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    const [coursesCount, usersCount, enrollmentsCount, certificatesCount] = await Promise.all([
      prisma.course.count(),
      prisma.user.count(),
      prisma.enrollment.count(),
      prisma.certificate.count(),
    ]);

    return {
      coursesCount,
      usersCount,
      enrollmentsCount,
      certificatesCount,
    };
  }),

  getAllCourses: adminProcedure.query(async () => {
    return await prisma.course.findMany({
      include: {
        modules: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getCourseById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.course.findUnique({
        where: { id: input.id },
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          test: {
            include: {
              questions: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
    }),

  createCourse: adminProcedure
    .input(
      z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string(),
        difficulty: z.string(),
        duration: z.number(),
        isPublished: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const course = await prisma.course.create({
        data: input,
      });
      return course;
    }),

  updateCourse: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        difficulty: z.string().optional(),
        duration: z.number().optional(),
        isPublished: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const course = await prisma.course.update({
        where: { id },
        data,
      });
      return course;
    }),

  deleteCourse: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await prisma.course.delete({
      where: { id: input.id },
    });
    return { success: true };
  }),

  // Add more admin procedures as needed for modules, lessons, etc.
  createModule: adminProcedure
    .input(
      z.object({
        courseId: z.string(),
        title: z.string(),
        description: z.string(),
        order: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.module.create({
        data: input,
      });
    }),

  createLesson: adminProcedure
    .input(
      z.object({
        moduleId: z.string(),
        title: z.string(),
        content: z.string(),
        duration: z.number(),
        order: z.number(),
        videoUrl: z.string().optional(),
        codeExample: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.lesson.create({
        data: input,
      });
    }),

  deleteModule: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await prisma.module.delete({
      where: { id: input.id },
    });
    return { success: true };
  }),

  updateModule: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.module.update({
        where: { id },
        data,
      });
    }),

  deleteLesson: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await prisma.lesson.delete({
      where: { id: input.id },
    });
    return { success: true };
  }),

  updateLesson: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        duration: z.number().optional(),
        order: z.number().optional(),
        videoUrl: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.lesson.update({
        where: { id },
        data,
      });
    }),

  createTest: adminProcedure
    .input(
      z.object({
        courseId: z.string(),
        title: z.string(),
        description: z.string(),
        passingScore: z.number(),
        timeLimit: z.number().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.test.create({
        data: input,
        include: { questions: true },
      });
    }),

  updateTestSettings: adminProcedure
    .input(
      z.object({
        courseId: z.string(),
        passingScore: z.number().optional(),
        timeLimit: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { courseId, ...data } = input;
      return await prisma.test.updateMany({
        where: { courseId },
        data,
      });
    }),

  addQuestion: adminProcedure
    .input(
      z.object({
        testId: z.string(),
        question: z.string(),
        type: z.string(),
        options: z.string(),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
        points: z.number().optional(),
        order: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.question.create({
        data: {
          ...input,
          points: input.points ?? 1,
        },
      });
    }),

  deleteQuestion: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await prisma.question.delete({
      where: { id: input.id },
    });
    return { success: true };
  }),

  updateTest: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        passingScore: z.number().optional(),
        timeLimit: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.test.update({
        where: { id },
        data,
      });
    }),

  updateQuestion: adminProcedure
    .input(
      z.object({
        id: z.string(),
        question: z.string().optional(),
        type: z.string().optional(),
        options: z.string().optional(),
        correctAnswer: z.string().optional(),
        explanation: z.string().optional(),
        points: z.number().optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.question.update({
        where: { id },
        data,
      });
    }),
});
