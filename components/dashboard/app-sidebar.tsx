"use client"

import * as React from "react"
import {
  BookOpen,
  LayoutDashboard,
  Search,
  Users,
  ShieldCheck,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  user: {
    name: string
    email: string
    role: string | null
  }
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export function AppSidebar({ user, activeTab, setActiveTab }: AppSidebarProps) {
  const pathname = usePathname()
  const isAdmin = user.role === "admin"
  const isTeacher = user.role === "teacher" || isAdmin

  const NavItem = ({ 
    id, 
    href, 
    icon: Icon, 
    label, 
    tooltip 
  }: { 
    id: string, 
    href: string, 
    icon: any, 
    label: string, 
    tooltip: string 
  }) => {
    const isActive = activeTab ? activeTab === id : pathname === href

    if (activeTab && setActiveTab) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={() => setActiveTab(id)}
            isActive={isActive} 
            tooltip={tooltip}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild
          isActive={isActive} 
          tooltip={tooltip}
        >
          <Link href={href}>
            <Icon className="size-4" />
            <span>{label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-foreground">VulnGuard</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">LMS Platform</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem 
                id="my-courses" 
                href="/dashboard" 
                icon={LayoutDashboard} 
                label="My Courses" 
                tooltip="My Courses" 
              />
              <NavItem 
                id="browse" 
                href="/dashboard/browse" 
                icon={Search} 
                label="Browse Courses" 
                tooltip="Browse Courses" 
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isTeacher && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem 
                  id="students" 
                  href="/dashboard/students" 
                  icon={Users} 
                  label="Manage Students" 
                  tooltip="Manage Students" 
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem 
                  id="admin-overview" 
                  href="/admin" 
                  icon={ShieldCheck} 
                  label="Admin Panel" 
                  tooltip="Admin Dashboard" 
                />
                <NavItem 
                  id="admin-courses" 
                  href="/admin/courses" 
                  icon={BookOpen} 
                  label="Course Management" 
                  tooltip="Course Content" 
                />
                <NavItem 
                  id="admin-users" 
                  href="/admin/users" 
                  icon={Users} 
                  label="User Management" 
                  tooltip="User Directory" 
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem 
                id="settings" 
                href="/dashboard/settings" 
                icon={Settings} 
                label="Settings" 
                tooltip="Settings" 
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

