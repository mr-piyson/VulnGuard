import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';

export const enrollmentsRouter = router({
  create: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { courseId } = input;
      const userId = ctx.session.user.id;

      // Check if already enrolled
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Already enrolled',
        });
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          userId,
          courseId,
        },
      });

      return enrollment;
    }),
});
