import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { createServerComponentClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Clock, DollarSign, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createServerComponentClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: event.name,
    description: event.description || "Event details",
  };
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = await createServerComponentClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !event) {
    notFound();
  }

  const formatDateRange = () => {
    if (!event.start_date) return "TBA";

    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : null;

    if (!endDate) return format(startDate, "MMMM d, yyyy");

    if (startDate.getFullYear() === endDate.getFullYear()) {
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${format(startDate, "MMMM d")}-${format(endDate, "d, yyyy")}`;
      }
      return `${format(startDate, "MMMM d")}-${format(endDate, "MMMM d, yyyy")}`;
    }

    return `${format(startDate, "MMMM d, yyyy")}-${format(endDate, "MMMM d, yyyy")}`;
  };

  const isRegistrationOpen = () => {
    const now = new Date();
    const regStart = event.registration_start_date ? new Date(event.registration_start_date) : null;
    const regEnd = event.registration_end_date ? new Date(event.registration_end_date) : null;
    
    return (!regStart || now >= regStart) && (!regEnd || now <= regEnd);
  };

  const isPastEvent = () => {
    return event.end_date && new Date(event.end_date) < new Date();
  };

  const isLiveEvent = () => {
    const now = new Date();
    const startDate = event.start_date ? new Date(event.start_date) : null;
    const endDate = event.end_date ? new Date(event.end_date) : null;

    return startDate && endDate && now >= startDate && now <= endDate;
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Event Banner */}
      <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
        {isLiveEvent() && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full z-20 animate-pulse">
            Live Now
          </div>
        )}
        <img 
          src={event.banner_image || "/placeholder.svg"} 
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-6 left-6 z-10 text-white">
          <h1 className="text-3xl md:text-4xl font-bold">{event.name}</h1>
          {event.event_type && (
            <Badge className="mt-2 bg-black/50 backdrop-blur-sm capitalize">
              {event.event_type}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              {event.rules && <TabsTrigger value="rules">Rules</TabsTrigger>}
              {event.requirements && <TabsTrigger value="requirements">Requirements</TabsTrigger>}
            </TabsList>
            <TabsContent value="about" className="prose max-w-none">
              <p>{event.description}</p>
            </TabsContent>
            {event.rules && (
              <TabsContent value="rules" className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: event.rules }} />
              </TabsContent>
            )}
            {event.requirements && (
              <TabsContent value="requirements" className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: event.requirements }} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Event Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Event Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 mt-0.5 mr-3 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Date & Time</h4>
                  <p className="text-muted-foreground">{formatDateRange()}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mt-0.5 mr-3 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-muted-foreground">{event.location}</p>
                  {event.event_type && (
                    <Badge variant="outline" className="mt-1 capitalize">
                      {event.event_type} event
                    </Badge>
                  )}
                </div>
              </div>
              
              {event.registration_end_date && (
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mt-0.5 mr-3 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Registration Deadline</h4>
                    <p className="text-muted-foreground">
                      {format(new Date(event.registration_end_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
              
              {event.current_participants !== null && (
                <div className="flex items-start">
                  <Users className="w-5 h-5 mt-0.5 mr-3 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Participants</h4>
                    <p className="text-muted-foreground">{event.current_participants} registered</p>
                  </div>
                </div>
              )}
              
              {event.prize_money && (
                <div className="flex items-start">
                  <Trophy className="w-5 h-5 mt-0.5 mr-3 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Prize Pool</h4>
                    <p className="text-muted-foreground">{event.prize_money}</p>
                  </div>
                </div>
              )}
              
              {event.registration_fee !== null && (
                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 mt-0.5 mr-3 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Registration Fee</h4>
                    <p className="text-muted-foreground">
                      {event.registration_fee === 0 ? "Free Entry" : `$${event.registration_fee}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />
            
            {isPastEvent() ? (
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/events/${event.id}/results`}>View Results</Link>
              </Button>
            ) : (
              <Button className="w-full" asChild disabled={!isRegistrationOpen()}>
                <Link href={`/events/${event.id}/register`}>
                  {isLiveEvent() ? "Join Now" : "Register"}
                </Link>
              </Button>
            )}
          </div>
          
          {event.max_team_size && event.max_team_size > 1 && (
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Team Information</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span>Min Team Size:</span>
                  <span className="font-medium">{event.min_team_size || 1}</span>
                </p>
                <p className="flex justify-between">
                  <span>Max Team Size:</span>
                  <span className="font-medium">{event.max_team_size}</span>
                </p>
              </div>
              <Separator className="my-4" />
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/events/${event.id}/team`}>Manage Team</Link>
              </Button>
            </div>
          )}
          
          {/* Payment Information (if applicable) */}
          {event.registration_fee > 0 && event.upi_id && (
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
              {event.qr_code_url && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src={event.qr_code_url} 
                    alt="Payment QR Code"
                    className="w-32 h-32 object-contain"
                  />
                </div>
              )}
              <p className="text-sm text-center text-muted-foreground mb-2">
                UPI ID: <span className="font-medium">{event.upi_id}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}