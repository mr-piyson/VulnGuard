"use client"

import { useState } from "react"
import { AppSidebar } from "./app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Award, LogOut, Settings, Bell, Shield } from "lucide-react"
import CourseGrid from "./course-grid"
import EnrolledCourses from "./enrolled-courses"
import UserManagement from "@/components/users/user-management"
import AdminOverview from "@/components/admin/admin-overview"
import AdminCourseList from "@/components/admin/admin-course-list"
import { Separator } from "@/components/ui/separator"

interface DashboardContentProps {
  user: any
  allCourses: any[]
  enrolledCourses: any[]
  userRole: string | null
  adminCourses: any[]
  adminStats: any
}

export default function DashboardContent({
  user,
  allCourses,
  enrolledCourses,
  userRole,
  adminCourses,
  adminStats,
}: DashboardContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("my-courses")
  const canManageStudents = userRole === "teacher" || userRole === "admin"

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || user.email[0].toUpperCase()

  const renderContent = () => {
    switch (activeTab) {
      case "my-courses":
        return <EnrolledCourses enrollments={enrolledCourses} userId={user.id} />
      case "browse":
        return <CourseGrid courses={allCourses} userId={user.id} />
      case "students":
        return canManageStudents ? (
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold">User Directory</h2>
              <p className="text-sm text-muted-foreground">Manage the teachers and students assigned to the platform.</p>
            </div>
            <UserManagement currentRole={userRole || "student"} />
          </div>
        ) : null
      case "admin-overview":
        return userRole === "admin" ? <AdminOverview stats={adminStats} /> : null
      case "admin-courses":
        return userRole === "admin" ? <AdminCourseList courses={adminCourses} /> : null
      default:
        return <EnrolledCourses enrollments={enrolledCourses} userId={user.id} />
    }
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case "my-courses": return "My Learning Path"
      case "browse": return "Explore Courses"
      case "students": return "User Management"
      case "admin-overview": return "Admin Dashboard"
      case "admin-courses": return "Course Management"
      default: return "Dashboard"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        user={{ ...user, role: userRole }} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">{getTabTitle()}</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/certificates">
                    <Award className="mr-2 h-4 w-4" />
                    My Certificates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-7xl">
            {renderContent()}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
