import UserManagement from "@/components/users/user-management"

export default async function AdminUsersPage() {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">User Directory</h2>
        <p className="text-sm text-muted-foreground">Manage teachers and students across the platform.</p>
      </div>
      
      <UserManagement currentRole="admin" />
    </div>
  )
}
