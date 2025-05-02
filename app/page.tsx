// EventSync/app/page.tsx
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection, SiteHeader, EventCard } from "@/app/ClientComponents";
import { getUpcomingEvents, getLiveEvents, getPastEvents } from "@/lib/services/event-service";

export default async function HomePage() {
  // Fetch events from Supabase
  const upcomingEvents = await getUpcomingEvents();
  const liveEvents = await getLiveEvents();
  const pastEvents = await getPastEvents();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />
        <section className="container pl-4 pr-8 mx-auto max-w-7xl py-12 md:py-16 lg:py-20">
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-4 md:mb-0">Explore Events</h2>
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
                    <EventCard key={event.id} event={event} />
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
                    <EventCard key={event.id} event={event} isLive />
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
                    <EventCard key={event.id} event={event} isPast />
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