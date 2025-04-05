// EventSync/components/dashboard-header.tsx (Verify this is the exact content)
'use client'

import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
// Ensure this line is GONE: import { createBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider' // Import useAuth hook
import { MainNav } from "@/components/main-nav"
import UserButton from "@/components/auth/UserButton" // Default import syntax

type DashboardHeaderProps = {
  user: User | null // Keep receiving user as prop for initial UI state
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const { signOut } = useAuth() // Get signOut function from context

  const handleSignOut = async () => {
    await signOut() // Use signOut from the Auth context
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <MainNav />
        <div className="flex items-center gap-4">
          {/* Pass user to UserButton if it uses it for initial rendering */}
          {user && <UserButton />}
          {/* You could add an explicit logout button here too if needed, using handleSignOut */}
        </div>
      </div>
    </header>
  )
}