import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Download, Eye } from "lucide-react"
import Link from "next/link"

export default async function CertificatesPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/auth/signin")
  }

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      course: true,
    },
    orderBy: { issuedAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">My Certificates</h2>
        <p className="text-muted-foreground text-sm">View and download your earned certificates</p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground mb-6">Complete courses and pass tests to earn certificates</p>
            <Link href="/dashboard/browse">
              <Button>Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{certificate.course.title}</CardTitle>
                <CardDescription>
                  Issued on{" "}
                  {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Certificate #: <span className="font-mono">{certificate.certificateNumber}</span>
                </p>
                <div className="flex gap-2 pt-2">
                  <Link href={`/courses/${certificate.course.slug}/certificate`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <a href={`/api/certificates/${certificate.id}/download`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
