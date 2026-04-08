import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';

export const progressRouter = router({
  update: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { lessonId, completed } = input;
      const userId = ctx.session.user.id;

      const progress = await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        update: {
          completed,
          completedAt: completed ? new Date() : null,
        },
        create: {
          userId,
          lessonId,
          completed,
          completedAt: completed ? new Date() : null,
        },
      });

      // Update enrollment progress
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          module: {
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
          },
        },
      });

      if (lesson) {
        const courseId = lesson.module.courseId;
        const allLessons = lesson.module.course.modules.flatMap((m) => m.lessons);

        const completedLessons = await prisma.progress.count({
          where: {
            userId,
            lessonId: { in: allLessons.map((l) => l.id) },
            completed: true,
          },
        });

        const progressPercentage = Math.round(
          (completedLessons / allLessons.length) * 100
        );

        await prisma.enrollment.update({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          data: {
            progress: progressPercentage,
            completedAt: progressPercentage === 100 ? new Date() : null,
          },
        });
      }

      return progress;
    }),
});
