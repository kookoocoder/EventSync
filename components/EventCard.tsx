import Link from "next/link"
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Updated interface to match Supabase schema
export interface DBEvent {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  location: string
  registration_fee: number | null
  max_team_size: number | null
  current_participants: number | null
  registration_end_date: string | null
  is_published: boolean | null
  prize_money: string | null
  banner_image: string | null
  event_type: string | null
  min_team_size: number | null
  requirements: string | null
  rules: string | null
  registration_start_date: string | null
  results_announcement_date: string | null
}

export interface EventCardProps {
  event: DBEvent
  isLive?: boolean
  isPast?: boolean
  isHackathon?: boolean
}

export function EventCard({ event, isLive = false, isPast = false, isHackathon = false }: EventCardProps) {
  // Debug event data
  console.log("EventCard received event:", event);
  
  // Safety check to ensure we have valid event data
  if (!event || !event.id) {
    console.error("EventCard received invalid event data:", event);
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
        <div className="p-4 text-center text-red-500">
          Error: Invalid event data
        </div>
      </Card>
    );
  }
  
  // Determine event type based on database field or prop
  const eventType = event.event_type === 'hackathon' || isHackathon ? "hackathons" : "events"
  
  // Format date range for display
  const formatDateRange = () => {
    try {
      if (!event.start_date) return "TBA"
      
      const startDate = new Date(event.start_date)
      const endDate = event.end_date ? new Date(event.end_date) : null
      
      if (!endDate) return format(startDate, "MMM d, yyyy")
      
      // If same year
      if (startDate.getFullYear() === endDate.getFullYear()) {
        // If same month
        if (startDate.getMonth() === endDate.getMonth()) {
          return `${format(startDate, "MMM d")}-${format(endDate, "d, yyyy")}`
        }
        // Different months, same year
        return `${format(startDate, "MMM d")}-${format(endDate, "MMM d, yyyy")}`
      }
      
      // Different years
      return `${format(startDate, "MMM d, yyyy")}-${format(endDate, "MMM d, yyyy")}`
    } catch (error) {
      console.error("Error formatting date range:", error, event.start_date, event.end_date);
      return "Invalid date"
    }
  }
  
  // Check if event is currently live
  const checkIfLive = () => {
    if (isLive) return true // Use prop if provided
    
    try {
      const now = new Date()
      const startDate = event.start_date ? new Date(event.start_date) : null
      const endDate = event.end_date ? new Date(event.end_date) : null
      
      return startDate && endDate && now >= startDate && now <= endDate
    } catch (error) {
      console.error("Error checking if event is live:", error);
      return false;
    }
  }
  
  // Get registration deadline text
  const getDeadlineText = () => {
    if (!event.registration_end_date) return "Open registration"
    
    try {
      return format(new Date(event.registration_end_date), "MMM d, yyyy")
    } catch (error) {
      console.error("Error formatting registration deadline:", error);
      return "Invalid deadline"
    }
  }
  
  const eventIsLive = checkIfLive()
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
      <div className="aspect-video relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        {eventIsLive && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full z-20 animate-pulse">
            Live Now
          </div>
        )}
        {event.registration_fee === 0 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full z-20">
            Free Entry
          </div>
        )}
        <img
          src={event.banner_image || "/placeholder.svg"}
          alt={event.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        {event.event_type && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-block bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full mr-2">
              {event.event_type}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <CardHeader className="px-4 py-3">
          <CardTitle className="line-clamp-1">{event.name}</CardTitle>
          <CardDescription className="line-clamp-2">{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-2 flex-1">
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{formatDateRange()}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{event.location}</span>
            </div>
            {event.current_participants !== null && (
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>{event.current_participants} participants</span>
              </div>
            )}
          </div>
        </CardContent>
        
        {event.registration_fee !== null && event.registration_fee > 0 && (
          <div className="px-4 mb-2">
            <div className="flex items-center font-medium">
              <Badge variant="outline" className="mr-2">
                ${event.registration_fee}
              </Badge>
              <span className="text-xs text-muted-foreground">Registration Fee</span>
            </div>
          </div>
        )}
        
        {event.prize_money && (
          <div className="px-4 mb-2">
            <div className="flex items-center font-medium">
              <Badge variant="outline" className="mr-2 bg-amber-50">
                {event.prize_money}
              </Badge>
              <span className="text-xs text-muted-foreground">Prize Pool</span>
            </div>
          </div>
        )}
        
        <CardFooter className="px-4 py-3 mt-auto">
          {isPast || (event.end_date && new Date(event.end_date) < new Date()) ? (
            <Button variant="outline" className="w-full">
              View Results
            </Button>
          ) : (
            <Link href={`/${eventType}/${event.id}/register`} className="w-full">
              <Button className="w-full">
                {eventIsLive ? "Join Now" : "Register"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </div>
    </Card>
  )
} 