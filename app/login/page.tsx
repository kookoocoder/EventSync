"use client"

import { useState, useEffect, useActionState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useFormStatus } from "react-dom"
import { Code, Eye, EyeOff } from "lucide-react"
import { loginUser } from "./actions"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" aria-disabled={pending} disabled={pending}>
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    let displayMessage = null;
    if (errorParam) {
      displayMessage = decodeURIComponent(errorParam);
    } else if (messageParam) {
      displayMessage = decodeURIComponent(messageParam);
    }
    setErrorMessage(displayMessage);
  }, [searchParams]);

  const initialState = { error: null };
  const [state, formAction] = useActionState(loginUser, initialState);

  useEffect(() => {
    if (state?.error) {
      setErrorMessage(state.error);
    }
  }, [state]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-violet-50 p-4">
      <Link href="/" className="absolute left-8 top-8 flex items-center gap-2 md:left-12 md:top-12">
        <Code className="h-6 w-6" />
        <span className="font-bold">HackSync</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="name@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
            {errorMessage && (
              <p className="text-sm font-medium text-destructive pt-2 text-center">{errorMessage}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <SubmitButton />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

