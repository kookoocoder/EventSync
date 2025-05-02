'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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

  // Animation variants for header items
  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.5
      }
    }
  };

  return (
    <motion.header 
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 shadow-sm"
    >
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
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/participant/points">
                      <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-muted/80 border border-primary/20 bg-primary/5">
                        <Coins className="h-3.5 w-3.5 text-primary" />
                        {pointsLoading ? (
                          <span className="h-4 w-10 animate-pulse rounded-md bg-muted"></span>
                        ) : (
                          <span className="font-medium">{points}</span>
                        )}
                      </Badge>
                    </Link>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="bg-card border-border shadow-md">
                  <p className="font-medium">Your blockchain points</p>
                  <p className="text-xs text-muted-foreground">{pointsLoading ? 'Loading...' : `Value: ₹${((points || 0) * 0.1).toFixed(2)} in discounts`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Use isLoading to prevent flash of incorrect state */}
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div> // Placeholder
          ) : user ? (
            <>
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                <Link href={dashboardPath}>
                  <Button variant="ghost" size="sm" className="font-medium px-4">
                    Dashboard
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <UserButton /> {/* Use UserButton for logged-in users */}
              </motion.div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium px-4">
                    Log in
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/register">
                  <Button size="sm" className="font-medium px-4 rounded-full bg-primary hover:bg-primary-dark">
                    Register
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}