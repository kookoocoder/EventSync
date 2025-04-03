"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs"
import { Calendar, MapPin, User, Loader2, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: string
  image: string
}

interface Registration {
  id: string
  eventId: string
  name: string
  email: string
  mobile: string
  college: string
  branch: string
  department: string
  address: string
  paymentStatus: string
  createdAt: string
  event?: Event
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch all registrations for the user
        const regResponse = await fetch('/api/event-registrations')
        if (!regResponse.ok) {
          const errorData = await regResponse.json()
          throw new Error(errorData.error || "Failed to fetch registrations")
        }
        const regData = await regResponse.json()
        
        // Get all events for reference
        const eventsResponse = await fetch('/api/events')
        if (!eventsResponse.ok) {
          const errorData = await eventsResponse.json()
          throw new Error(errorData.error || "Failed to fetch events")
        }
        const eventsData = await eventsResponse.json()
        setEvents(eventsData)
        
        // Enrich registrations with event data
        const enrichedRegistrations = regData.map((reg: Registration) => {
          const event = eventsData.find((e: Event) => e.id === reg.eventId)
          return { ...reg, event }
        })
        
        setRegistrations(enrichedRegistrations)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!session && status === "unauthenticated") {
    router.push('/auth/login?callbackUrl=/dashboard')
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
      <div className="min-h-screen bg-black flex items-center justify-center">
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

  const pendingRegistrations = registrations.filter(reg => reg.paymentStatus === "Pending Verification")
  const confirmedRegistrations = registrations.filter(reg => reg.paymentStatus !== "Pending Verification")

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <p className="text-gray-400">Welcome back, {session?.user?.name || 'User'}</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl">Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{session?.user?.name || 'User'}</p>
                      <p className="text-sm text-gray-400">{session?.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <span>Event Registrations</span>
                      <span className="bg-yellow-300 text-black font-medium px-2 py-1 rounded-md text-xs">
                        {registrations.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <span>Pending Verification</span>
                      <span className="bg-zinc-700 text-gray-200 px-2 py-1 rounded-md text-xs">
                        {pendingRegistrations.length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-zinc-800 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black">
                  All Registrations
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="confirmed" className="data-[state=active]:bg-yellow-300 data-[state=active]:text-black">
                  Confirmed
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <h2 className="text-xl font-bold mb-4">Your Registrations</h2>
                
                {registrations.length === 0 ? (
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-400 mb-4">You haven't registered for any events yet.</p>
                      <Link href="/">
                        <Button className="bg-yellow-300 hover:bg-yellow-400 text-black">
                          Browse Events
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <RegistrationCard 
                        key={registration.id} 
                        registration={registration} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pending" className="mt-0">
                <h2 className="text-xl font-bold mb-4">Pending Registrations</h2>
                
                {pendingRegistrations.length === 0 ? (
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-400">You don't have any pending registrations.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pendingRegistrations.map((registration) => (
                      <RegistrationCard 
                        key={registration.id} 
                        registration={registration} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="confirmed" className="mt-0">
                <h2 className="text-xl font-bold mb-4">Confirmed Registrations</h2>
                
                {confirmedRegistrations.length === 0 ? (
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-400">You don't have any confirmed registrations yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {confirmedRegistrations.map((registration) => (
                      <RegistrationCard 
                        key={registration.id} 
                        registration={registration} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

function RegistrationCard({ registration }: { registration: Registration }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Event Image/Thumbnail */}
          {registration.event?.image && (
            <div className="md:w-1/4 relative">
              <div className="h-32 md:h-full relative">
                <Image 
                  src={registration.event.image} 
                  alt={registration.event?.title || 'Event'} 
                  fill 
                  className="object-cover" 
                />
              </div>
            </div>
          )}
          
          {/* Registration Details */}
          <div className="p-6 flex-grow">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">
                {registration.event?.title || 'Event Registration'}
              </h3>
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>Registered on {new Date(registration.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Name</p>
                <p className="text-white">{registration.name}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white">{registration.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Mobile</p>
                <p className="text-white">{registration.mobile}</p>
              </div>
              <div>
                <p className="text-gray-400">College/University</p>
                <p className="text-white">{registration.college}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {registration.event && (
                  <>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-yellow-400" />
                      <span>{new Date(registration.event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-yellow-400" />
                      <span>{registration.event.location}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                registration.paymentStatus === "Confirmed" 
                  ? "bg-green-900/50 text-green-400" 
                  : "bg-yellow-900/50 text-yellow-400"
              }`}>
                {registration.paymentStatus}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-zinc-800/50 p-4 flex justify-end">
        <Link href={`/event-registration/${registration.eventId}/confirmation`}>
          <Button variant="outline" size="sm" className="border-zinc-700 text-white hover:bg-zinc-800">
            View Details <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 