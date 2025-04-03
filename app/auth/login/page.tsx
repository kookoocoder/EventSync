"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams?.get("registered")) {
      setSuccess("Account created successfully! Please sign in.")
    }
  }, [searchParams])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("Attempting login with email:", email)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("SignIn result:", result)

      if (result?.error) {
        setError("Invalid email or password")
        setDebugInfo(`Error details: ${result.error}`)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Something went wrong. Please try again.")
      setDebugInfo(error instanceof Error ? error.stack : String(error))
    } finally {
      setIsLoading(false)
    }
  }

  // For demonstration purposes - showing the credentials
  const adminCredentials = {
    email: "admin@example.com",
    password: "admin123"
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-zinc-900 border-none">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Welcome Back</CardTitle>
          {success && (
            <CardDescription className="text-center text-green-500 mt-2">
              {success}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={adminCredentials.email}
                required
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                defaultValue={adminCredentials.password}
                required
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            {debugInfo && (
              <div className="text-yellow-500 text-xs mt-2 bg-black/50 p-2 rounded">
                Debug info: {debugInfo}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-yellow-300 hover:bg-yellow-400 text-black"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-center text-sm text-gray-400 mt-4">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-yellow-300 hover:underline">
                Create account
              </Link>
            </div>
            <div className="text-center text-xs text-gray-600 mt-4 p-2 bg-black/30 rounded">
              For testing: Admin credentials are pre-filled.<br/>
              Email: {adminCredentials.email}<br/>
              Password: {adminCredentials.password}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 