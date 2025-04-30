'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import UserButton from "@/components/auth/UserButton"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Coins } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SiteHeader() {
  const { user, isLoading } = useAuth()
  const [points, setPoints] = useState<number | null>(null)
  const [pointsLoading, setPointsLoading] = useState(false)

  // Determine dashboard path based on user type
  const userType = user?.user_metadata?.userType
  let dashboardPath = '/dashboard' // Default
   if (userType === 'organizer') {
       dashboardPath = '/organizer/dashboard'
   } else if (userType === 'participant') {
       dashboardPath = '/participant/dashboard'
   }

  // Fetch points for participants
  useEffect(() => {
    if (user && userType === 'participant') {
      const fetchPoints = async () => {
        try {
          setPointsLoading(true);
          const response = await fetch(`/api/blockchain/balance?participantId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setPoints(data.balance || 0);
          }
        } catch (error) {
          console.error('Error fetching points:', error);
        } finally {
          setPointsLoading(false);
        }
      };
      
      fetchPoints();
    }
  }, [user, userType]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container pl-4 pr-8 mx-auto max-w-7xl flex h-16 items-center justify-between">
        <MainNav />
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Points display for participants */}
          {user && userType === 'participant' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/participant/points">
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 cursor-pointer hover:bg-muted">
                      <Coins className="h-3.5 w-3.5" />
                      {pointsLoading ? (
                        <span className="h-4 w-10 animate-pulse rounded-md bg-muted"></span>
                      ) : (
                        <span>{points}</span>
                      )}
                    </Badge>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your blockchain points</p>
                  <p className="text-xs">{pointsLoading ? 'Loading...' : `Value: ₹${((points || 0) * 0.1).toFixed(2)} in discounts`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

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