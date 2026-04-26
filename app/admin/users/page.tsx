import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";
import UserManagement from "@/components/users/user-management";

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/dashboard");
  } else {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== "admin") {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Manage Users</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">User Directory</h2>
          <p className="text-muted-foreground">Manage teachers and students across the platform.</p>
        </div>
        
        <UserManagement currentRole="admin" />
      </main>
    </div>
  );
}
