import { router } from './trpc';
import { progressRouter } from './routers/progress';
import { enrollmentsRouter } from './routers/enrollments';
import { testsRouter } from './routers/tests';
import { adminRouter } from './routers/admin';
import { usersRouter } from './routers/users';
import { certificatesRouter } from './routers/certificates';
import { coursesRouter } from './routers/courses';

export const appRouter = router({
  progress: progressRouter,
  enrollments: enrollmentsRouter,
  tests: testsRouter,
  admin: adminRouter,
  users: usersRouter,
  certificates: certificatesRouter,
  courses: coursesRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
