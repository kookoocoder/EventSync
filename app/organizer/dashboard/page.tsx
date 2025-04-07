// EventSync/app/organizer/dashboard/page.tsx (Updated to fetch from 'organizers' table)
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  Clock,
  Edit,
  Eye,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash2,
  Trophy,
  Users,
} from "lucide-react"
import { format } from "date-fns"

import { Auth } from '@/lib/auth-server'
import { createServerComponentClient } from '@/lib/supabase/server' // Updated path
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/SiteHeader"

// Helper function to format date range
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Format as "May 15-17, 2025" if in same month
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMM d")}-${format(end, "d, yyyy")}`
  }
  
  // Format as "May 30 - Jun 2, 2025" if different months
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
}

export default async function OrganizerDashboardPage() {
  // Use requireAuth to ensure user is logged in and redirect server-side if not
  const user = await Auth.requireOrganizer() // Ensures organizer role

  const supabase = await createServerComponentClient()
  let organizerProfile: any = null // Renamed variable for clarity, will hold data from organizers table
  let profileError: string | null = null
  
  // Variables to store events data
  let activeEvents: OrganizerHackathon[] = []
  let pastEvents: OrganizerHackathon[] = []
  let eventsError: string | null = null
  let stats = [
    { title: "Total Hackathons", value: "0", icon: Calendar },
    { title: "Total Participants", value: "0", icon: Users },
    { title: "Active Events", value: "0", icon: Clock },
    { title: "Prize Money Awarded", value: "$0", icon: Trophy },
  ]
  
  try {
    // Fetch profile data specifically from the 'organizers' table using the authenticated user's ID
    const { data: profile, error } = await supabase
      .from('organizers') 
      .select('name, organization_name, organization_website')
      .eq('id', user.id) 
      .single() 

    if (error && error.code !== 'PGRST116') { // Ignore 'PGRST116' (No rows found)
      throw error
    }
    organizerProfile = profile // Assign fetched data
    
    // Fetch all events by this organizer
    const now = new Date().toISOString()
    
    // Fetch active events (end_date >= now)
    const { data: activeEventsData, error: activeError } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', user.id)
      .gte('end_date', now)
      .order('start_date', { ascending: true })
    
    if (activeError) throw activeError
    
    // Fetch past events (end_date < now)
    const { data: pastEventsData, error: pastError } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', user.id)
      .lt('end_date', now)
      .order('start_date', { ascending: false })
    
    if (pastError) throw pastError
    
    // Fetch registrations data for participant counts
    const { data: registrationsData, error: regError } = await supabase
      .from('registrations')
      .select('id, event_id, status')
      .in('event_id', [...(activeEventsData || []), ...(pastEventsData || [])].map(e => e.id))
    
    if (regError) throw regError
    
    // Process events data to match the OrganizerHackathon interface
    if (activeEventsData) {
      activeEvents = activeEventsData.map(event => {
        // Count participants for this event
        const eventRegistrations = registrationsData?.filter(r => r.event_id === event.id) || []
        const registeredCount = eventRegistrations.length
        const approvedCount = eventRegistrations.filter(r => r.status === 'approved').length
        const pendingCount = eventRegistrations.filter(r => r.status === 'pending').length
        
        // Determine event status
        const now = new Date()
        const startDate = new Date(event.start_date)
        const endDate = new Date(event.end_date)
        const regEndDate = event.registration_end_date ? new Date(event.registration_end_date) : null
        
        let status = "Draft"
        if (event.is_published) {
          if (now < startDate) {
            status = regEndDate && now > regEndDate ? "Registration Closed" : "Registration Open"
          } else if (now >= startDate && now <= endDate) {
            status = "Live Now"
          } else {
            status = "Completed"
          }
        }
        
        return {
          id: event.id,
          title: event.name,
          description: event.description || "",
          image: event.banner_image || "/placeholder.svg?height=400&width=600",
          date: formatDateRange(event.start_date, event.end_date),
          location: event.location,
          registrationDeadline: event.registration_end_date ? format(new Date(event.registration_end_date), "MMM d, yyyy") : "No deadline",
          participants: {
            registered: registeredCount,
            approved: approvedCount,
            pending: pendingCount,
          },
          status,
        }
      })
    }
    
    if (pastEventsData) {
      pastEvents = pastEventsData.map(event => {
        // Count participants for this event
        const eventRegistrations = registrationsData?.filter(r => r.event_id === event.id) || []
        const registeredCount = eventRegistrations.length
        const approvedCount = eventRegistrations.filter(r => r.status === 'approved').length
        const pendingCount = eventRegistrations.filter(r => r.status === 'pending').length
        
        return {
          id: event.id,
          title: event.name,
          description: event.description || "",
          image: event.banner_image || "/placeholder.svg?height=400&width=600",
          date: formatDateRange(event.start_date, event.end_date),
          location: event.location,
          registrationDeadline: event.registration_end_date ? format(new Date(event.registration_end_date), "MMM d, yyyy") : "No deadline",
          participants: {
            registered: registeredCount,
            approved: approvedCount,
            pending: pendingCount,
          },
          status: "Completed",
        }
      })
    }
    
    // Calculate stats
    const totalEvents = (activeEventsData?.length || 0) + (pastEventsData?.length || 0)
    const totalParticipants = registrationsData?.length || 0
    const activeEventsCount = activeEventsData?.length || 0
    
    // Sum up prize money (ensure it's a valid number, otherwise use 0)
    let totalPrizeMoney = 0
    const allEvents = [...(activeEventsData || []), ...(pastEventsData || [])]
    allEvents.forEach(event => {
      if (event.prize_money) {
        const moneyValue = parseFloat(event.prize_money.replace(/[^0-9.-]+/g, ""))
        if (!isNaN(moneyValue)) {
          totalPrizeMoney += moneyValue
        }
      }
    })
    
    // Format prize money with '$' prefix and commas
    const formattedPrizeMoney = '$' + totalPrizeMoney.toLocaleString()
    
    // Update stats
    stats = [
      { title: "Total Hackathons", value: totalEvents.toString(), icon: Calendar },
      { title: "Total Participants", value: totalParticipants.toString(), icon: Users },
      { title: "Active Events", value: activeEventsCount.toString(), icon: Clock },
      { title: "Prize Money Awarded", value: formattedPrizeMoney, icon: Trophy },
    ]
    
  } catch (err: any) {
    console.error("Error fetching data:", err)
    profileError = "Failed to load organizer data."
    eventsError = "Failed to load events data."
  }

  return (
    // Removed DashboardAuthWrapper
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {profileError ? (
          <div className="container py-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-6">
              <p>{profileError}</p>
            </div>
          </div>
        ) : (
          <div className="container py-8">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
                <Link href="/organizer/create-event">
                  <Button className="gap-1">
                    <Plus className="h-4 w-4" />
                    Create Hackathon
                  </Button>
                </Link>
              </div>

              {/* Stats Cards */}
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 {stats.map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0">
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          <stat.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="mt-3">
                          <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
               </div>

              {/* Error message for events if needed */}
              {eventsError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-6">
                  <p>{eventsError}</p>
                </div>
              )}

               {/* Hackathon Tabs */}
              <Tabs defaultValue="active" className="w-full">
                <TabsList>
                  <TabsTrigger value="active">Active Hackathons</TabsTrigger>
                  <TabsTrigger value="past">Past Hackathons</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="space-y-4 pt-4">
                  {activeEvents.length > 0 ? (
                    activeEvents.map((hackathon) => (
                      <HackathonCard key={hackathon.id} hackathon={hackathon} />
                    ))
                  ) : (
                     <p className="text-muted-foreground text-center py-4">No active hackathons found. <Link href="/organizer/create-event" className="text-primary hover:underline">Create one now!</Link></p>
                  )}
                </TabsContent>
                <TabsContent value="past" className="space-y-4 pt-4">
                 {pastEvents.length > 0 ? (
                    pastEvents.map((hackathon) => (
                      <HackathonCard key={hackathon.id} hackathon={hackathon} isPast />
                    ))
                 ) : (
                     <p className="text-muted-foreground text-center py-4">No past hackathons found.</p>
                 )}
                </TabsContent>
              </Tabs>

              {/* Organizer Info */}
               {organizerProfile && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {organizerProfile.name && <p className="mb-1"><span className="font-medium">Contact Name:</span> {organizerProfile.name}</p>}
                            {organizerProfile.organization_name && <p className="mb-1"><span className="font-medium">Organization:</span> {organizerProfile.organization_name}</p>}
                            {organizerProfile.organization_website && <p><span className="font-medium">Website:</span> <a href={organizerProfile.organization_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{organizerProfile.organization_website}</a></p>}
                        </CardContent>
                         <CardFooter>
                             <Link href="/organizer/profile">
                                <Button variant="outline" size="sm">Edit Profile</Button>
                            </Link>
                        </CardFooter>
                    </Card>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// HackathonCard Component
interface OrganizerHackathon {
  id: string
  title: string
  description: string
  image?: string
  date: string
  location: string
  registrationDeadline: string
  participants: {
    registered: number | string
    approved: number | string
    pending: number | string
  }
  status: string
}

function HackathonCard({ hackathon, isPast = false }: {
  hackathon: OrganizerHackathon
  isPast?: boolean
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 lg:w-1/5 flex-shrink-0">
          <img
            src={hackathon.image || "/placeholder.svg"}
            alt={hackathon.title}
             className="h-full w-full object-cover aspect-video md:aspect-auto" // Adjust aspect ratio
          />
        </div>
        <div className="flex flex-1 flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-2"> {/* Use items-start */}
              <div className="flex-1"> {/* Allow title/desc to wrap */}
                <CardTitle>{hackathon.title}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">{hackathon.description}</CardDescription> {/* Limit description lines */}
              </div>
              <div className="flex-shrink-0"> {/* Prevent dropdown from wrapping */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuItem asChild>
                       <Link href={`/hackathons/${hackathon.id}`}> {/* Link to public details page */}
                         <Eye className="mr-2 h-4 w-4" /> View Public Page
                       </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link href={`/organizer/dashboard/${hackathon.id}`}> {/* Link to event dashboard */}
                            <BarChart3 className="mr-2 h-4 w-4" /> Event Dashboard
                        </Link>
                     </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/organizer/edit-event/${hackathon.id}`}> {/* Link to edit page */}
                        <Edit className="mr-2 h-4 w-4" /> Edit Hackathon
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      {/* Add Delete Logic Here */}
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Hackathon
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
               <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{hackathon.date}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{hackathon.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>Deadline: {hackathon.registrationDeadline}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">Registered</p>
                <p className="text-xl font-bold">{hackathon.participants.registered}</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">{hackathon.participants.approved}</p>
              </div>
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{hackathon.participants.pending}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center mt-auto pt-4"> {/* Ensure alignment */}
            <div className="text-sm">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isPast ? "bg-muted text-muted-foreground" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"}`}>
                {hackathon.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href={`/organizer/registrations/${hackathon.id}`}>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" /> Manage Registrations
                </Button>
              </Link>
               <Link href={`/organizer/dashboard/${hackathon.id}`}>
                 <Button size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" /> Dashboard
                 </Button>
              </Link>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}