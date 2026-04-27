import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const testsRouter = router({
  submit: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
        answers: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { testId, answers } = input;
      const userId = ctx.session.user.id;

      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          questions: true,
        },
      });

      if (!test) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Test not found',
        });
      }

      // Calculate score
      let correctCount = 0;
      const feedback = test.questions.map((question) => {
        const userAnswer = answers[question.id];
        const correct = userAnswer === question.correctAnswer;

        if (correct) {
          correctCount++;
        }

        return {
          questionId: question.id,
          question: question.question,
          userAnswer: userAnswer || 'Not answered',
          correctAnswer: question.correctAnswer,
          correct,
          explanation: question.explanation,
        };
      });

      const score = Math.round((correctCount / test.questions.length) * 100);
      const passed = score >= test.passingScore;

      // Save result
      await prisma.$transaction(async (tx) => {
        await tx.testResult.create({
          data: {
            userId,
            testId: test.id,
            score,
            passed,
            answers: JSON.stringify(answers),
          },
        });

        if (passed) {
          // Mark enrollment as complete
          await tx.enrollment.update({
            where: {
              userId_courseId: {
                userId,
                courseId: test.courseId,
              },
            },
            data: {
              progress: 100,
              completedAt: new Date(),
            },
          });

          // Generate certificate if it doesn't exist
          const existingCert = await tx.certificate.findUnique({
            where: {
              userId_courseId: {
                userId,
                courseId: test.courseId,
              },
            },
          });

          if (!existingCert) {
            const certificateNumber = `VGD-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)
              .toUpperCase()}`;
            await tx.certificate.create({
              data: {
                userId,
                courseId: test.courseId,
                certificateNumber,
              },
            });
          }
        }
      });

      return {
        score,
        passed,
        feedback,
      };
    }),

  getOrCreate: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ input }) => {
      const { courseId } = input;

      let test = await prisma.test.findFirst({
        where: { courseId },
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!test) {
        const course = await prisma.course.findUnique({
          where: { id: courseId },
        });

        if (!course) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
        }

        test = await prisma.test.create({
          data: {
            courseId,
            title: `${course.title} - Final Assessment`,
            description: "Test your knowledge of the course material",
            passingScore: 70,
            timeLimit: 30,
          },
          include: {
            questions: true,
          },
        });
      }

      return test;
    }),

  getResults: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await prisma.testResult.findMany({
        where: {
          userId: ctx.session.user.id,
          testId: input.testId,
        },
        orderBy: { completedAt: "desc" },
      });
    }),
});
