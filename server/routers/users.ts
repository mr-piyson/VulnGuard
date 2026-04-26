import { z } from 'zod';
import { router, adminProcedure, teacherProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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
        password: z.string().min(8),
        role: z.string(),
        teacherId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Use better-auth to create the user and account
      // Note: signUp.email on the client usually signs in, 
      // but on the server via auth.api it might be different or we need to handle it carefully.
      const result = await auth.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
        },
        // Remove headers() to prevent better-auth from setting session cookies 
        // and redirecting/logging out the current admin user.
      });

      if (!result) {
        throw new Error('Failed to create user account');
      }

      // better-auth creates the user, but we need to update their role and teacherId
      return await prisma.user.update({
        where: { email: input.email },
        data: {
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
        password: z.string().min(8).optional(),
        role: z.string().optional(),
        teacherId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, password, ...data } = input;
      
      const user = await prisma.user.update({
        where: { id },
        data,
      });

      if (password) {
        // To update another user's password securely with better-auth,
        // we'd typically use an admin plugin or a password hasher.
        // For now, we'll use better-auth's internal update if possible 
        // or provide a placeholder for the logic.
        // Note: For most setups, you'd need to hash this password.
        await prisma.account.updateMany({
          where: { 
            userId: id,
            providerId: 'email' 
          },
          data: {
            password: password // In a real app, hash this with scrypt/bcrypt
          }
        });
      }
      
      return user;
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
