import Link from "next/link"
import { Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/SiteHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EventCard } from "@/components/EventCard"
import { getUpcomingEvents, getLiveEvents, getPastEvents } from "@/lib/services/event-service"

export default async function EventsPage() {
  // Fetch events from Supabase
  console.log("Events page: Starting to fetch events");
  const upcomingEvents = await getUpcomingEvents();
  const liveEvents = await getLiveEvents();
  const pastEvents = await getPastEvents();
  
  console.log("Events page: Finished fetching events");
  console.log(`Events page: Upcoming: ${upcomingEvents.length}, Live: ${liveEvents.length}, Past: ${pastEvents.length}`);

  return (
    <div className="flex min-h-screen flex-col">
          <SiteHeader />
      <main className="flex-1">
        <section className="bg-muted py-12 md:py-16">
          <div className="container pl-4 pr-8 mx-auto max-w-7xl">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Discover Events</h1>
              <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Find the perfect event to showcase your skills, learn new technologies, and connect with like-minded
                innovators.
              </p>
              <div className="mt-8 flex w-full max-w-md flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search events..." className="pl-8" />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] shrink-0">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="online">Online Only</SelectItem>
                    <SelectItem value="in-person">In-Person Only</SelectItem>
                    <SelectItem value="free">Free Registration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="container pl-4 pr-8 mx-auto max-w-7xl py-12 md:py-16">
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-4 md:mb-0">Browse Events</h2>
              <TabsList className="mx-auto md:mx-0">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="live">Live Now</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="upcoming" className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id}>
                      {/* Debug info */}
                      <div className="text-xs text-gray-400 mb-1">
                        Debug: Event ID: {event.id.substring(0, 8)}...
                      </div>
                      <EventCard event={event} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-muted-foreground">No upcoming events found.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="live" className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {liveEvents.length > 0 ? (
                  liveEvents.map((event) => (
                    <div key={event.id}>
                      {/* Debug info */}
                      <div className="text-xs text-gray-400 mb-1">
                        Debug: Event ID: {event.id.substring(0, 8)}...
                      </div>
                      <EventCard event={event} isLive />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-muted-foreground">No live events at the moment.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="past" className="space-y-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.length > 0 ? (
                  pastEvents.map((event) => (
                    <div key={event.id}>
                      {/* Debug info */}
                      <div className="text-xs text-gray-400 mb-1">
                        Debug: Event ID: {event.id.substring(0, 8)}...
                      </div>
                      <EventCard event={event} isPast />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-muted-foreground">No past events found.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container pl-4 pr-8 mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EventSync. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="/contact" className="hover:underline underline-offset-4">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

