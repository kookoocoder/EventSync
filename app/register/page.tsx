// EventSync/app/register/page.tsx (Convert to use Server Action like login)
"use client"

import React from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { register } from './actions' // Import the server action
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Mail,
  Lock,
  User,
  Loader,
  UserCircle,
  Radio
} from 'lucide-react'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define the state shape for the action
interface RegisterState {
  error: string | null;
  // Add success state if needed, but action redirects on success
}

const initialState: RegisterState = {
  error: null,
}

function RegisterButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        'Sign up'
      )}
    </Button>
  )
}


export default function RegisterPage() {
  const [state, formAction] = useActionState<RegisterState, FormData>(register, initialState)
  // Keep userType state for the RadioGroup component
  const [userType, setUserType] = React.useState<'organizer' | 'participant'>('participant');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

         {/* Display error message using Alert component */}
         {state?.error && (
           <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
           </Alert>
         )}

        {/* Use form with server action */}
        <form className="mt-8 space-y-6" action={formAction}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="email" // Ensure name matches action expectations
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="name"
                  name="name" // Ensure name matches action expectations
                  type="text"
                  autoComplete="name"
                  required
                  className="pl-10"
                  placeholder="Your Name"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username">Username</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="username"
                  name="username" // Ensure name matches action expectations
                  type="text"
                  autoComplete="username"
                  required
                  className="pl-10"
                  placeholder="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  name="password" // Ensure name matches action expectations
                  type="password"
                  autoComplete="new-password"
                  required
                  className="pl-10"
                  placeholder="••••••••"
                  // Add pattern for complexity if desired, or rely on Supabase rules
                  // pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}"
                  // title="Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
                />
              </div>
               <p className="mt-1 text-xs text-muted-foreground">
                 Password must meet Supabase requirements (check your Supabase Auth settings).
               </p>
            </div>

            {/* Account Type */}
            <div>
              <Label htmlFor="userType">Account Type</Label>
              {/* Hidden input to pass userType to the server action */}
              <input type="hidden" name="userType" value={userType} />
              <RadioGroup
                value={userType} // Controlled by local state
                onValueChange={(value) => setUserType(value as 'organizer' | 'participant')} // Update local state
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="participant" id="participant" />
                  <Label htmlFor="participant" className="font-normal">Participant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="organizer" id="organizer" />
                  <Label htmlFor="organizer" className="font-normal">Organizer</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <RegisterButton />
          </div>
        </form>
      </div>
    </div>
  )
}