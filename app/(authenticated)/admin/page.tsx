"use client";

import { trpc } from "@/lib/trpc/client";
import AdminOverview from "@/components/admin/admin-overview";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();

  if (isLoading || !stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm">Monitor platform health and key business metrics.</p>
      </div>
      <AdminOverview stats={stats} />
    </div>
  );
}
