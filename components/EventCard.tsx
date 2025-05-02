"use client";

// EventSync/components/EventCard.tsx
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegistrationButton } from "@/components/RegistrationButton";

// Updated interface to match Supabase schema
export interface DBEvent {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string;
  registration_fee: number | null;
  max_team_size: number | null;
  current_participants: number | null;
  registration_end_date: string | null;
  is_published: boolean | null;
  prize_money: string | null;
  banner_image: string | null;
  event_type: string | null;
  min_team_size: number | null;
  requirements: string | null;
  rules: string | null;
  registration_start_date: string | null;
  results_announcement_date: string | null;
}

export interface EventCardProps {
  event: DBEvent;
  isLive?: boolean;
  isPast?: boolean;
  isHackathon?: boolean;
}

export function EventCard({ event, isLive = false, isPast = false, isHackathon = false }: EventCardProps) {
  // Add hover state for animations
  const [isHovered, setIsHovered] = useState(false);
  
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
  const eventType = event.event_type === 'hackathon' || isHackathon ? "hackathons" : "events";

  // Format date range for display
  const formatDateRange = () => {
    try {
      if (!event.start_date) return "TBA";

      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : null;

      if (!endDate) return format(startDate, "MMM d, yyyy");

      // If same year
      if (startDate.getFullYear() === endDate.getFullYear()) {
        // If same month
        if (startDate.getMonth() === endDate.getMonth()) {
          return `${format(startDate, "MMM d")}-${format(endDate, "d, yyyy")}`;
        }
        // Different months, same year
        return `${format(startDate, "MMM d")}-${format(endDate, "MMM d, yyyy")}`;
      }

      // Different years
      return `${format(startDate, "MMM d, yyyy")}-${format(endDate, "MMM d, yyyy")}`;
    } catch (error) {
      console.error("Error formatting date range:", error, event.start_date, event.end_date);
      return "Invalid date";
    }
  };

  // Check if event is currently live
  const checkIfLive = () => {
    if (isLive) return true; // Use prop if provided

    try {
      const now = new Date();
      const startDate = event.start_date ? new Date(event.start_date) : null;
      const endDate = event.end_date ? new Date(event.end_date) : null;

      return startDate && endDate && now >= startDate && now <= endDate;
    } catch (error) {
      console.error("Error checking if event is live:", error);
      return false;
    }
  };

  // Get registration deadline text
  const getDeadlineText = () => {
    if (!event.registration_end_date) return "Open registration";

    try {
      return format(new Date(event.registration_end_date), "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting registration deadline:", error);
      return "Invalid deadline";
    }
  };

  const eventIsLive = checkIfLive();

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 card-hover flex flex-col h-full rounded-xl" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${eventType}/${event.id}`} className="flex-1 flex flex-col">
        <div className="aspect-video relative overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
          {eventIsLive && (
            <div className="absolute top-3 right-3 bg-primary px-3 py-1 rounded-full z-20 animate-pulse flex items-center gap-1.5">
              <span className="bg-white w-2 h-2 rounded-full"></span>
              <span className="text-white text-xs font-medium">Live Now</span>
            </div>
          )}
          {event.registration_fee === 0 && (
            <div className="absolute top-3 left-3 bg-success text-white text-xs font-medium px-3 py-1 rounded-full z-20">
              Free Entry
            </div>
          )}
          <div className="relative w-full h-full">
            <Image
              src={event.banner_image || "/placeholder.svg"}
              alt={event.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={!!eventIsLive}
              loading={eventIsLive ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          </div>
          {event.event_type && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="inline-block bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full mr-2 capitalize">
                {event.event_type}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <CardHeader className="px-5 py-4">
            <CardTitle className="font-['Outfit'] text-xl line-clamp-1">{event.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{event.description}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 py-2 flex-1">
            <div className="flex flex-col space-y-2.5 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2.5 h-4 w-4 text-primary" />
                <span>{formatDateRange()}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2.5 h-4 w-4 text-primary" />
                <span>{event.location}</span>
              </div>
              {event.current_participants !== null && (
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-2.5 h-4 w-4 text-primary" />
                  <span>{event.current_participants} participants</span>
                </div>
              )}
            </div>
          </CardContent>

          {event.registration_fee !== null && event.registration_fee > 0 && (
            <div className="px-5 mb-2">
              <div className="flex items-center font-medium">
                <Badge variant="outline" className="mr-2 bg-muted/50">
                  ₹{event.registration_fee}
                </Badge>
                <span className="text-xs text-muted-foreground">Registration Fee</span>
              </div>
            </div>
          )}

          {event.prize_money && (
            <div className="px-5 mb-2">
              <div className="flex items-center font-medium">
                <Badge variant="outline" className="mr-2 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                  {event.prize_money}
                </Badge>
                <span className="text-xs text-muted-foreground">Prize Pool</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      <CardFooter className="px-5 py-4 mt-auto border-t">
        {isPast || (event.end_date && new Date(event.end_date) < new Date()) ? (
           <Link href={`/${eventType}/${event.id}/results`} className="w-full">
               <Button variant="outline" className="w-full rounded-full font-medium">
                   View Results
               </Button>
           </Link>
        ) : (
          <RegistrationButton 
            eventId={event.id}
            eventType={eventType as 'events' | 'hackathons'}
            isLive={!!eventIsLive}
            isPast={!!isPast}
            showStatus={false}
          />
        )}
      </CardFooter>
    </Card>
  );
}