// EventSync/app/login/page.tsx
"use client"

import Link from 'next/link';
import { useActionState } from 'react'; // React's hook for server actions
import { useFormStatus } from 'react-dom'; // Hook to check form submission status
import { login } from './actions'; // Import the server action
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2 } from 'lucide-react'; // Changed Loader to Loader2 for consistency
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the expected shape of the state returned by the login action
interface LoginState {
  error: string | null;
}

// Initial state for useActionState
const initialState: LoginState = {
  error: null,
};

// Component for the submit button, aware of form pending state
function LoginButton() {
  const { pending } = useFormStatus(); // Get pending state from form context

  return (
    <Button type="submit" className="w-full" aria-disabled={pending} disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {/* Using Loader2 */}
          Signing in...
        </>
      ) : (
        'Sign in'
      )}
    </Button>
  );
}

// The main login page component
export default function LoginPage() {
  // Hook server action to component state
  const [state, formAction] = useActionState<LoginState, FormData>(login, initialState);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign in to your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        {/* Display error messages returned from the server action */}
        {state?.error && (
          <Alert variant="destructive" role="alert">
             <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Form using the server action */}
        <form className="mt-8 space-y-6" action={formAction}>
          <div className="rounded-md shadow-sm space-y-4"> {/* Grouped inputs */}
            {/* Email Input */}
            <div>
              <Label htmlFor="email" className="sr-only">Email address</Label> {/* Screen reader label */}
              <div className="relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                 </div>
                <Input
                  id="email"
                  name="email" // Crucial for server action to get data
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 h-10" // Adjusted padding/height
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password" className="sr-only">Password</Label>
               <div className="relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                   <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                 </div>
                <Input
                  id="password"
                  name="password" // Crucial for server action to get data
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10 h-10" // Adjusted padding/height
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          {/* Remember Me / Forgot Password Row */}
          <div className="flex items-center justify-end"> {/* Aligned to end */}
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <LoginButton />
          </div>
        </form>
      </div>
    </div>
  );
}