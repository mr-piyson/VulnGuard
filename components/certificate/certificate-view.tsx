"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2, Award } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

interface CertificateViewProps {
  certificate: {
    id: string;
    certificateNumber: string;
    issuedAt: Date | string;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
}

export default function CertificateView({ certificate, course, user }: CertificateViewProps) {
  const [downloading, setDownloading] = useState(false);

  const downloadMutation = trpc.certificates.download.useMutation();

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const { pdfBase64, filename } = await downloadMutation.mutateAsync({ id: certificate.id });

      // Convert base64 to blob
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download certificate:", error);
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Congratulations!</h1>
          <p className="text-muted-foreground">You have successfully completed the course</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="relative bg-linear-to-br from-primary/5 via-background to-primary/5 p-12 border-8 border-primary/20">
              <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-primary/30 pointer-events-none" />

              <div className="text-center space-y-6 relative">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-wider text-muted-foreground">Certificate of Completion</p>
                  <h2 className="text-4xl font-bold text-primary">TeachNLearn Academy</h2>
                </div>

                <div className="space-y-4 py-8">
                  <p className="text-lg text-muted-foreground">This is to certify that</p>
                  <p className="text-3xl font-bold">{user.name || user.email}</p>
                  <p className="text-lg text-muted-foreground">has successfully completed</p>
                  <p className="text-2xl font-semibold text-primary">{course.title}</p>
                </div>

                <div className="flex items-center justify-center gap-12 pt-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Date of Completion</p>
                    <p className="font-semibold">{formattedDate}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Certificate Number</p>
                    <p className="font-mono font-semibold">{certificate.certificateNumber}</p>
                  </div>
                </div>

                <div className="pt-8">
                  <div className="inline-block">
                    <div className="border-t-2 border-foreground pt-2">
                      <p className="font-semibold">TeachNLearn Academy</p>
                      <p className="text-sm text-muted-foreground">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownload} disabled={downloading} size="lg">
            <Download className="h-5 w-5 mr-2" />
            {downloading ? "Generating PDF..." : "Download Certificate"}
          </Button>
          <Button variant="outline" size="lg" className="bg-transparent">
            <Share2 className="h-5 w-5 mr-2" />
            Share Certificate
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Verify this certificate at: https://TeachNLearn-academy.com/verify/{certificate.certificateNumber}
          </p>
          <Link href="/dashboard">
            <Button variant="link">Continue Learning →</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
