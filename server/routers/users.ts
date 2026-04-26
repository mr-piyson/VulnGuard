import { z } from 'zod';
import { router, adminProcedure, teacherProcedure } from '../trpc';
import { prisma } from '@/lib/db';

export const usersRouter = router({
  getManagedUsers: teacherProcedure.query(async ({ ctx }) => {
    const { session, userRole } = ctx;

    if (userRole === 'admin') {
      // Admin sees everyone (except maybe other admins if we want to filter them out)
      return await prisma.user.findMany({
        where: {
          role: { in: ['teacher', 'student'] },
        },
        include: {
          teacher: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Teacher sees only their students
      return await prisma.user.findMany({
        where: {
          teacherId: session.user.id,
          role: 'student',
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  }),

  getTeachers: adminProcedure.query(async () => {
    return await prisma.user.findMany({
      where: { role: 'teacher' },
      select: { id: true, name: true, email: true },
    });
  }),

  createUser: adminProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        role: z.string(),
        teacherId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // In a real app, you'd create an account with a hashed password too.
      // For this demo, we'll create the user record. 
      // Better-auth will handle account creation if they sign in or we use its API.
      return await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: input.name,
          email: input.email,
          role: input.role,
          teacherId: input.teacherId,
        },
      });
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.string().optional(),
        teacherId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.user.update({
        where: { id },
        data,
      });
    }),

  assignStudentToTeacher: adminProcedure
    .input(z.object({ studentId: z.string(), teacherId: z.string().nullable() }))
    .mutation(async ({ input }) => {
      return await prisma.user.update({
        where: { id: input.studentId },
        data: { teacherId: input.teacherId },
      });
    }),

  removeStudentFromTeacher: teacherProcedure
    .input(z.object({ studentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { session, userRole } = ctx;
      
      if (userRole === 'admin') {
        return await prisma.user.update({
          where: { id: input.studentId },
          data: { teacherId: null },
        });
      }

      // Check if student is actually assigned to this teacher
      const student = await prisma.user.findUnique({
        where: { id: input.studentId },
        select: { teacherId: true },
      });

      if (student?.teacherId !== session.user.id) {
        throw new Error('You do not have permission to manage this student');
      }

      return await prisma.user.update({
        where: { id: input.studentId },
        data: { teacherId: null },
      });
    }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.user.delete({
        where: { id: input.userId },
      });
    }),
});
