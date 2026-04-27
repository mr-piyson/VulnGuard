"use client";

import { trpc } from "@/lib/trpc/client";
import UserManagement from "@/components/users/user-management";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentManagementPage() {
  const router = useRouter();
  const { data: user, isLoading } = trpc.users.me.useQuery();

  useEffect(() => {
    if (!isLoading && user && user.role !== "teacher" && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">User Directory</h2>
        <p className="text-sm text-muted-foreground">Manage the teachers and students assigned to the platform.</p>
      </div>
      <UserManagement currentRole={user.role || "student"} />
    </div>
  );
}
