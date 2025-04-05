// EventSync/app/login/page.tsx (Ensure it uses useActionState correctly)
"use client"

import Link from 'next/link'
import { useActionState } from 'react' // Correct import from react
import { useFormStatus } from 'react-dom'
import { login } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Loader } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert" // Import Alert components

// Define the expected shape of the state returned by the action
interface LoginState {
  error: string | null;
}

const initialState: LoginState = {
  error: null,
}

function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" aria-disabled={pending} disabled={pending}>
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        'Sign in'
      )}
    </Button>
  )
}

export default function LoginPage() {
  // Use useActionState from React
  const [state, formAction] = useActionState<LoginState, FormData>(login, initialState) // Add type annotations

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to your account</h1>
          <p className="mt-2 text-sm text-muted-foreground"> {/* Updated text color */}
            Or{' '}
            <Link href="/register" className="font-medium text-primary hover:underline"> {/* Use primary color */}
              create a new account
            </Link>
          </p>
        </div>

        {/* Display error message using Alert component */}
        {state?.error && (
          <Alert variant="destructive">
             <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Use form element with the action */}
        <form className="mt-8 space-y-6" action={formAction}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-muted-foreground" /> {/* Updated color */}
                </div>
                <Input
                  id="email"
                  name="email" // Name attribute is required for server actions
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-muted-foreground" /> {/* Updated color */}
                </div>
                <Input
                  id="password"
                  name="password" // Name attribute is required for server actions
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end"> {/* Aligned forgot password link */}
            <div className="text-sm">
              {/* Link to forgot password page if you have one */}
              <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline"> {/* Use primary color */}
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <LoginButton />
          </div>
        </form>
      </div>
    </div>
  )
}