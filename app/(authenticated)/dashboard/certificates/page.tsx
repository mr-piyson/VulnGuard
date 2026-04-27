"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Loader2 } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import CertificateCard from "@/components/certificate/certificate-card";

export default function CertificatesPage() {
  const { data: certificates, isLoading } = trpc.certificates.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">My Certificates</h2>
        <p className="text-muted-foreground text-sm">View and download your earned certificates</p>
      </div>

      {!certificates || certificates.length === 0 ? (
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
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      )}
    </div>
  );
}
