import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { jsPDF } from "jspdf";

export const certificatesRouter = router({
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const certificate = await prisma.certificate.findUnique({
      where: { id: input.id },
      include: {
        course: true,
        user: true,
      },
    });

    if (!certificate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Certificate not found",
      });
    }

    if (certificate.userId !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to view this certificate",
      });
    }

    return certificate;
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.certificate.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        course: true,
      },
      orderBy: {
        issuedAt: "desc",
      },
    });
  }),

  getOrCreate: protectedProcedure.input(z.object({ courseId: z.string() })).mutation(async ({ input, ctx }) => {
    const userId = ctx.session.user.id;
    const { courseId } = input;

    let certificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: true,
        user: true,
      },
    });

    if (!certificate) {
      // Check if user passed the test
      const test = await prisma.test.findFirst({
        where: { courseId },
      });

      if (!test) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Test not found for this course",
        });
      }

      const passedTest = await prisma.testResult.findFirst({
        where: {
          userId,
          testId: test.id,
          passed: true,
        },
      });

      if (!passedTest) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must pass the test to earn a certificate",
        });
      }

      const certificateNumber = `CSEC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      certificate = await prisma.certificate.create({
        data: {
          userId,
          courseId,
          certificateNumber,
        },
        include: {
          course: true,
          user: true,
        },
      });
    }

    return certificate;
  }),

  download: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const certificate = await prisma.certificate.findUnique({
      where: { id: input.id },
      include: {
        user: true,
        course: true,
      },
    });

    if (!certificate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Certificate not found",
      });
    }

    if (certificate.userId !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Unauthorized",
      });
    }

    // Generate PDF
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    doc.setLineWidth(0.5);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Title
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 35, { align: "center" });

    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.text("TeachNLearn Academy", pageWidth / 2, 50, { align: "center" });

    // Content
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("This is to certify that", pageWidth / 2, 75, { align: "center" });

    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text(certificate.user.name || certificate.user.email, pageWidth / 2, 90, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("has successfully completed", pageWidth / 2, 105, { align: "center" });

    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text(certificate.course.title, pageWidth / 2, 120, { align: "center" });

    // Date and Certificate Number
    const formattedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Date of Completion", pageWidth / 2 - 40, 145, { align: "center" });
    doc.text("Certificate Number", pageWidth / 2 + 40, 145, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(formattedDate, pageWidth / 2 - 40, 153, { align: "center" });
    doc.text(certificate.certificateNumber, pageWidth / 2 + 40, 153, { align: "center" });

    // Signature
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 30, 175, pageWidth / 2 + 30, 175);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("TeachNLearn Academy", pageWidth / 2, 182, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Authorized Signature", pageWidth / 2, 188, { align: "center" });

    const pdfBase64 = doc.output("datauristring").split(",")[1];

    return {
      pdfBase64,
      filename: `certificate-${certificate.certificateNumber}.pdf`,
    };
  }),
});
