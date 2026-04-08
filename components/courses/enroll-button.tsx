"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc/client"

interface EnrollButtonProps {
  courseId: string
}

export default function EnrollButton({ courseId }: EnrollButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const enroll = trpc.enrollments.create.useMutation()

  const handleEnroll = async () => {
    setLoading(true)

    try {
      await enroll.mutateAsync({ courseId });
      router.refresh()
    } catch (error) {
      console.error("Failed to enroll:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="lg" onClick={handleEnroll} disabled={loading}>
      {loading ? "Enrolling..." : "Enroll Now"}
    </Button>
  )
}
