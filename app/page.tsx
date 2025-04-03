"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Instagram, Twitter, MessageCircle, Calendar, Clock, MapPin, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  image: string
  category: string
  isLive: boolean
}

export default function EventSyncPortal() {
  const { data: session } = useSession()
  const [activeSlide, setActiveSlide] = useState(0)
  const [events, setEvents] = useState<{
    upcoming: Event[]
    live: Event[]
    past: Event[]
  }>({
    upcoming: [],
    live: [],
    past: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()
        
        const now = new Date()
        const upcoming = data.filter((event: Event) => 
          !event.isLive && new Date(event.date) > now
        )
        const live = data.filter((event: Event) => event.isLive)
        const past = data.filter((event: Event) => 
          !event.isLive && new Date(event.date) < now
        )
        
        setEvents({ upcoming, live, past })
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEvents()
  }, [])

  const upcomingEvents = [
    {
      id: "1",
      title: "2025 Spring Chess Classic",
      date: "May 15-20, 2025",
      location: "Grand Convention Center",
      image: "/placeholder.svg?height=900&width=600",
      category: "Competition",
      isLive: false,
      description: ""
    },
    {
      id: "2",
      title: "Tech Innovators Summit",
      date: "June 5-7, 2025",
      location: "Digital Hub Arena",
      image: "/placeholder.svg?height=900&width=600",
      category: "Conference",
      isLive: false,
      description: ""
    },
    {
      id: "3",
      title: "Creative Arts Workshop",
      date: "July 12, 2025",
      location: "Cultural Center",
      image: "/placeholder.svg?height=900&width=600",
      category: "Workshop",
      isLive: false,
      description: ""
    },
  ]

  const liveEvents = [
    {
      id: "1",
      title: "Global Tech Conference",
      date: "Happening Now",
      location: "Innovation Center",
      image: "/placeholder.svg?height=900&width=600",
      category: "Live",
      isLive: true,
      description: ""
    },
  ]

  const pastEvents = [
    {
      id: "1",
      title: "Hackathon 2024",
      date: "December 10, 2024",
      location: "Tech Campus",
      image: "/placeholder.svg?height=900&width=600",
      category: "Competition",
      isLive: false,
      description: ""
    },
  ]

  // Use fetched events if available, otherwise use default events
  const displayEvents = {
    upcoming: events.upcoming.length > 0 ? events.upcoming : upcomingEvents,
    live: events.live.length > 0 ? events.live : liveEvents,
    past: events.past.length > 0 ? events.past : pastEvents
  }

  const nextSlide = () => {
    setActiveSlide((prev: number) => (prev + 1) % displayEvents.upcoming.length)
  }

  const prevSlide = () => {
    setActiveSlide((prev: number) => (prev - 1 + displayEvents.upcoming.length) % displayEvents.upcoming.length)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-white flex items-center justify-center">
            <span className="text-xl">⌘</span>
          </div>
          <span className="text-2xl tracking-wider font-light">EventSync</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="hover:text-yellow-300 transition-colors">
            About
          </a>
          <a href="#" className="hover:text-yellow-300 transition-colors">
            Events
          </a>
          <a href="#" className="hover:text-yellow-300 transition-colors">
            Contact
          </a>
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-yellow-300 transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-yellow-300 transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="hover:text-yellow-300 transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="hover:text-yellow-300 transition-colors">
            <MessageCircle className="w-5 h-5" />
          </a>
          
          {session ? (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-white hover:text-yellow-300"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
              <Button 
                className="bg-yellow-300 hover:bg-yellow-400 text-black font-medium rounded-full flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>{session.user?.name || 'Account'}</span>
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:text-yellow-300">
                  My Registrations
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="outline" className="rounded-full border-white hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-yellow-300 hover:bg-yellow-400 text-black font-medium rounded-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <Badge className="bg-yellow-300 text-black hover:bg-yellow-300">EVENTS</Badge>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">JOIN US IRL</h1>
          <p className="text-lg text-gray-300 max-w-md">
            We pride ourselves on meeting and hanging out with our community in real life. Come join us at a number of
            conferences and hangouts throughout the year.
          </p>
          <div className="flex gap-4">
            <Button className="bg-yellow-300 hover:bg-yellow-400 text-black font-medium rounded-full">
              Find Events
            </Button>
          </div>
        </div>
        <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
          <Image src="/placeholder.svg?height=600&width=800" alt="Conference event" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30"></div>
        </div>
      </section>

      {/* Events Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="flex flex-col sm:flex-row w-full gap-4 mb-8 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="upcoming"
              className="text-lg py-3 px-6 rounded-lg border border-gray-700 hover:border-yellow-300 data-[state=active]:bg-yellow-300 data-[state=active]:text-black data-[state=active]:border-yellow-300 transition-colors flex-1 h-auto data-[state=active]:shadow-none"
            >
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger
              value="live"
              className="text-lg py-3 px-6 rounded-lg border border-gray-700 hover:border-yellow-300 data-[state=active]:bg-yellow-300 data-[state=active]:text-black data-[state=active]:border-yellow-300 transition-colors flex-1 h-auto data-[state=active]:shadow-none"
            >
              Live Events
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="text-lg py-3 px-6 rounded-lg border border-gray-700 hover:border-yellow-300 data-[state=active]:bg-yellow-300 data-[state=active]:text-black data-[state=active]:border-yellow-300 transition-colors flex-1 h-auto data-[state=active]:shadow-none"
            >
              Past Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-8">
            <div className="relative">
              <div className="overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {displayEvents.upcoming.map((event) => (
                    <div key={event.id} className="w-full flex-shrink-0 px-1">
                      <Card className="bg-zinc-900 border-none overflow-hidden">
                        <div className="relative w-full h-0 pb-[150%]">
                          <Image
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                          <Badge className="absolute top-4 right-4 bg-yellow-300 text-black">{event.category}</Badge>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                          <div className="space-y-2 text-gray-300">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-0">
                          {session ? (
                            <Link href={`/event-registration/${event.id}`} className="w-full">
                              <Button 
                                className="w-full bg-yellow-300 hover:bg-yellow-400 text-black"
                                onClick={(e) => {
                                  // Show loading state manually before navigation
                                  const target = e.currentTarget;
                                  const originalText = target.innerText;
                                  
                                  target.innerText = "Loading...";
                                  target.disabled = true;
                                }}
                              >
                                Register Now
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/auth/login?callbackUrl=/event-registration/${event.id}`} className="w-full">
                              <Button className="w-full bg-yellow-300 hover:bg-yellow-400 text-black">Login to Register</Button>
                            </Link>
                          )}
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 border-none hover:bg-black/70"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 border-none hover:bg-black/70"
                onClick={nextSlide}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              <div className="flex justify-center gap-2 mt-4">
                {displayEvents.upcoming.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${activeSlide === index ? "bg-yellow-300" : "bg-gray-600"}`}
                    onClick={() => setActiveSlide(index)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="live">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.live.map((event) => (
                <Card key={event.id} className="bg-zinc-900 border-none overflow-hidden">
                  <div className="relative w-full h-0 pb-[150%]">
                    <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      LIVE NOW
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    {session ? (
                      <Link href={`/event-registration/${event.id}`} className="w-full">
                        <Button 
                          className="w-full bg-red-500 hover:bg-red-600"
                          onClick={(e) => {
                            // Show loading state manually before navigation
                            const target = e.currentTarget;
                            const originalText = target.innerText;
                            
                            target.innerText = "Loading...";
                            target.disabled = true;
                          }}
                        >
                          Join Now
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/auth/login?callbackUrl=/event-registration/${event.id}`} className="w-full">
                        <Button className="w-full bg-red-500 hover:bg-red-600">Login to Join</Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.past.map((event) => (
                <Card key={event.id} className="bg-zinc-900 border-none overflow-hidden">
                  <div className="relative w-full h-0 pb-[150%]">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover grayscale"
                    />
                    <Badge className="absolute top-4 right-4 bg-gray-700">{event.category}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Stay Updated on Events</h2>
            <p className="text-gray-300">
              Subscribe to our newsletter to get notified about upcoming events and early access to registrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-black/50 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-300 flex-grow"
              />
              <Button className="bg-yellow-300 hover:bg-yellow-400 text-black rounded-full">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border border-white flex items-center justify-center">
                <span className="text-sm">⌘</span>
              </div>
              <span className="text-xl tracking-wider font-light">EventSync</span>
            </div>
            <div className="text-sm text-gray-400">© 2025 EventSync. All rights reserved.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-yellow-300 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-yellow-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-yellow-300 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 