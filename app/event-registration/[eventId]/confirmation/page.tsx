"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: string
}

interface Registration {
  id: string
  name: string
  college: string
  branch: string
  department: string
  address: string
  email: string
  mobile: string
  paymentStatus: string
  createdAt: string
}

export default function RegistrationConfirmationPage({ params }: { params: { eventId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch event details
        const eventResponse = await fetch(`/api/events?eventId=${params.eventId}`)
        if (!eventResponse.ok) {
          const errorData = await eventResponse.json()
          throw new Error(errorData.error || "Failed to fetch event details")
        }
        const eventData = await eventResponse.json()
        setEvent(eventData)
        
        // Fetch registration details
        const regResponse = await fetch(`/api/event-registrations?eventId=${params.eventId}`)
        if (!regResponse.ok) {
          const errorData = await regResponse.json()
          throw new Error(errorData.error || "Registration not found")
        }
        
        const regData = await regResponse.json()
        setRegistration(regData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "Failed to load registration details")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (status === "authenticated") {
      fetchData()
    }
  }, [params.eventId, session, status])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!session && status === "unauthenticated") {
    router.push(`/auth/login?callbackUrl=/event-registration/${params.eventId}/confirmation`)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Redirecting to login...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-zinc-900 border-none">
          <CardHeader>
            <CardTitle className="text-xl text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white text-center">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button className="bg-yellow-300 hover:bg-yellow-400 text-black">
                Return Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-2xl mx-auto bg-zinc-900 border-none">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-white">Registration Successful!</CardTitle>
            <CardDescription className="text-gray-400">
              {event?.title}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="bg-zinc-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4 text-yellow-300">Registration Details</h3>
              
              {registration && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="text-white">{registration.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">{registration.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Mobile</p>
                      <p className="text-white">{registration.mobile}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">College/University</p>
                      <p className="text-white">{registration.college}</p>
                    </div>
                    {registration.branch && (
                      <div>
                        <p className="text-gray-400 text-sm">Branch</p>
                        <p className="text-white">{registration.branch}</p>
                      </div>
                    )}
                    {registration.department && (
                      <div>
                        <p className="text-gray-400 text-sm">Department</p>
                        <p className="text-white">{registration.department}</p>
                      </div>
                    )}
                  </div>
                  
                  {registration.address && (
                    <div>
                      <p className="text-gray-400 text-sm">Address</p>
                      <p className="text-white">{registration.address}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Payment Status</p>
                        <p className="text-green-400 font-medium">
                          {registration.paymentStatus || "Pending Verification"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Registration Date</p>
                        <p className="text-white">
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-yellow-900/20 p-6 rounded-lg border border-yellow-900/30">
              <h3 className="text-lg font-medium mb-2 text-yellow-300">What's Next?</h3>
              <p className="text-gray-300 mb-4">
                Your registration is complete. We'll verify your payment and send you a confirmation email
                with further details about the event.
              </p>
              <p className="text-gray-300">
                You can view your registration details anytime in your account dashboard.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                Back to Events
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-yellow-300 hover:bg-yellow-400 text-black">
                Go to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 