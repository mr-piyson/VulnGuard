import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import CertificateView from "@/components/certificate/certificate-view"

export default async function CertificatePage({ params }: { params: { slug: string } }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/auth/signin")
  }

  const course = await prisma.course.findUnique({
    where: { slug: (await params).slug },
  })

  if (!course) {
    notFound()
  }

  // Check if user has passed the test
  const test = await prisma.test.findFirst({
    where: { courseId: course.id },
  })

  if (!test) {
    redirect(`/courses/${params.slug}`)
  }

  const passedTest = await prisma.testResult.findFirst({
    where: {
      userId: session.user.id,
      testId: test.id,
      passed: true,
    },
  })

  if (!passedTest) {
    redirect(`/courses/${params.slug}/test`)
  }

  // Get or create certificate
  let certificate = await prisma.certificate.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
  })

  if (!certificate) {
    // Generate unique certificate number
    const certificateNumber = `CSEC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    certificate = await prisma.certificate.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        certificateNumber,
      },
    })
  }

  return <CertificateView certificate={certificate} course={course} user={session.user} />
}
