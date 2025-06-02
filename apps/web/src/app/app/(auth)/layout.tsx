import type React from "react"
import { AuthHeader } from "@/components/auth/auth-header"
import { Toaster } from "@/components/ui/toaster"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center py-10">{children}</main>
      <Toaster />
    </div>
  )
}
