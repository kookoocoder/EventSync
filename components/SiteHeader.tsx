// EventSync/components/SiteHeader.tsx (No changes needed, should work with updated AuthProvider)
'use client'

import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import UserButton from "@/components/auth/UserButton"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  const { user, isLoading } = useAuth()

  // Determine dashboard path based on user type
  const userType = user?.user_metadata?.userType
  let dashboardPath = '/dashboard' // Default
   if (userType === 'organizer') {
       dashboardPath = '/organizer/dashboard'
   } else if (userType === 'participant') {
       dashboardPath = '/participant/dashboard'
   }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <MainNav />
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Use isLoading to prevent flash of incorrect state */}
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div> // Placeholder
          ) : user ? (
            <>
              <Link href={dashboardPath}>
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <UserButton /> {/* Use UserButton for logged-in users */}
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}