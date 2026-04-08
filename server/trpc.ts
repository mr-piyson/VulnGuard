import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';

/**
 * Initialization of tRPC backend
 * Should be done only once per app!
 */
const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure
 */
export const protectedProcedure = t.procedure.use(async (opts) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      session,
    },
  });
});

/**
 * Admin procedure
 */
export const adminProcedure = protectedProcedure.use(async (opts) => {
  const user = await prisma.user.findUnique({
    where: {
      id: opts.ctx.session.user.id,
    },
    select: {
      role: true,
    },
  });

  if (user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return opts.next();
});
