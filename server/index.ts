import { router } from './trpc';
import { progressRouter } from './routers/progress';
import { enrollmentsRouter } from './routers/enrollments';
import { testsRouter } from './routers/tests';
import { adminRouter } from './routers/admin';
import { usersRouter } from './routers/users';

export const appRouter = router({
  progress: progressRouter,
  enrollments: enrollmentsRouter,
  tests: testsRouter,
  admin: adminRouter,
  users: usersRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
