'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Settings } from 'lucide-react'

export default function UserButton() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return null
  }

  const userInitials = user.user_metadata?.name 
    ? `${user.user_metadata.name.split(' ')[0][0]}${user.user_metadata.name.split(' ')[1] ? user.user_metadata.name.split(' ')[1][0] : ''}`
    : user.email?.substring(0, 2).toUpperCase() || 'U'

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const userType = user.user_metadata?.userType
let profilePath = '/profile' // Default
   if (userType === 'organizer') {
       profilePath = '/organizer/profile'
   } else if (userType === 'participant') {
       profilePath = '/participant/profile'
   }

   let dashboardPath = '/dashboard' // Default
   if (userType === 'organizer') {
       dashboardPath = '/organizer/dashboard'
   } else if (userType === 'participant') {
       dashboardPath = '/participant/dashboard'
   }
   
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.user_metadata?.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {userType && (
              <p className="text-xs text-muted-foreground capitalize">{userType}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(profilePath)}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (userType !== 'organizer') {
              router.push('/settings')
            }
          }}
          disabled={userType === 'organizer'}
          className={userType === 'organizer' ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}