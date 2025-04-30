import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createServerComponentClient } from "@/lib/supabase/server";
import { Calendar, Clock, Code, GraduationCap, MapPin, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";

export async function generateMetadata(props: { params: { id: string } }): Promise<Metadata> {
  const { id } = await props.params;

  const supabase = await createServerComponentClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
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

export default async function EventPage(props: { params: { id: string } }) {
  const { id } = await props.params;

  const supabase = await createServerComponentClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get event details
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  // Check if user is already registered
  let registration = null;
  if (user) {
    const { data: regData } = await supabase
      .from("registrations")
      .select("id, status, payment_status")
      .eq("event_id", id)
      .eq("participant_id", user.id)
      .maybeSingle();
    
    registration = regData;
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

  const getRegistrationButton = () => {
    if (isPastEvent()) {
      return (
        <Button className="w-full" variant="outline" asChild>
          <Link href={`/events/${event.id}/results`}>View Results</Link>
        </Button>
      );
    }

    if (!user) {
      return (
        <Button className="w-full" size="lg" asChild>
          <Link href={`/login?redirectTo=/events/${event.id}`}>
            Login to Register
          </Link>
        </Button>
      );
    }

    if (registration) {
      const status = registration.status;
      const paymentStatus = registration.payment_status;
      
      if (status === 'approved') {
        return (
          <div className="space-y-2">
            <Badge className="w-full bg-green-500 py-2 text-center">Registration Approved</Badge>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/participant/dashboard">View Registration</Link>
            </Button>
          </div>
        );
      }
      
      if (status === 'rejected') {
        return (
          <div className="space-y-2">
            <Badge className="w-full bg-red-500 py-2 text-center">Registration Rejected</Badge>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/participant/dashboard">View Details</Link>
            </Button>
          </div>
        );
      }
      
      if (status === 'pending') {
        const message = paymentStatus === 'pending' 
          ? "Payment Verification Pending" 
          : "Approval Pending";
        
        return (
          <div className="space-y-2">
            <Badge className="w-full bg-yellow-500 py-2 text-center">{message}</Badge>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/participant/dashboard">View Status</Link>
            </Button>
          </div>
        );
      }
    }

    return (
      <Button className="w-full" size="lg" asChild disabled={!isRegistrationOpen()}>
        <Link href={`/events/${event.id}/register`}>
          {isLiveEvent() ? "Join Now" : "Register for Event"}
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
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
          <div className="absolute bottom-0 left-0 right-0 z-20 container py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDateRange()}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{event.location || "TBA"}</span>
                </div>
                {event.current_participants !== null && (
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>
                      {event.current_participants} {event.max_participants ? `/ ${event.max_participants}` : ""} participants
                    </span>
                  </div>
                )}
                {event.registration_end_date && (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Registration closes: {format(new Date(event.registration_end_date), "MMMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              {/* Main Content */}
              <div className="flex-1 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                    {event.organizer && <CardDescription>Organized by {event.organizer}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap break-words">{event.description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {event.prize_money && <TabsTrigger value="prizes">Prizes</TabsTrigger>}
                    {event.rules && <TabsTrigger value="rules">Rules</TabsTrigger>}
                    {event.requirements && <TabsTrigger value="requirements">Requirements</TabsTrigger>}
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 pt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {event.location && (
                            <div className="flex border-l-2 border-primary pl-4 pb-4 relative">
                              <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary" />
                              <div className="flex-1">
                                <div className="flex flex-col gap-1">
                                  <h3 className="font-medium">Location</h3>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>{event.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {event.start_date && (
                            <div className="flex border-l-2 border-primary pl-4 pb-4 relative">
                              <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary" />
                              <div className="flex-1">
                                <div className="flex flex-col gap-1">
                                  <h3 className="font-medium">Date & Time</h3>
                                  <p className="text-sm text-muted-foreground">Event Starts at</p>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>{formatDateRange()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {event.prize_money && (
                    <TabsContent value="prizes" className="space-y-4 pt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-lg p-6 bg-yellow-50 border border-yellow-200">
                              <div className="flex items-center gap-4">
                                <div className="rounded-full p-2 bg-yellow-100 text-yellow-700">
                                  <Trophy className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-medium">Prize Pool</h3>
                                  <p className="text-2xl font-bold text-yellow-700">{event.prize_money}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {event.rules && (
                    <TabsContent value="rules" className="space-y-4 pt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: event.rules }} />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  {event.requirements && (
                    <TabsContent value="requirements" className="space-y-4 pt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: event.requirements }} />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="w-full md:w-80 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      {getRegistrationButton()}

                      {event.registration_end_date && (
                        <div className="rounded-lg bg-muted p-4">
                          <h3 className="font-medium mb-2">Registration Deadline</h3>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(event.registration_end_date), "MMMM d, yyyy")}</span>
                          </div>
                        </div>
                      )}

                      {event.current_participants !== null && event.max_participants && (
                        <div className="rounded-lg bg-muted p-4">
                          <h3 className="font-medium mb-2">Participants</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{event.current_participants} registered</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round((event.current_participants / event.max_participants) * 100)}% full
                            </span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted-foreground/20">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{
                                width: `${(event.current_participants / event.max_participants) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {(event.max_team_size || event.min_team_size) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start">
                        <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Team Size</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.min_team_size || 1}-{event.max_team_size} members per team
                          </p>
                        </div>
                      </div>
                      
                      {!isPastEvent() && event.max_team_size > 1 && (
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/events/${event.id}/team`}>Manage Team</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {event.registration_fee > 0 && event.upi_id && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {event.qr_code_url && (
                        <div className="mb-4 flex justify-center">
                          <img 
                            src={event.qr_code_url} 
                            alt="Payment QR Code"
                            className="w-32 h-32 object-contain"
                          />
                        </div>
                      )}
                      <p className="text-sm text-center">
                        UPI ID: <span className="font-medium">{event.upi_id}</span>
                      </p>
                      <p className="text-sm text-center mt-2">
                        Registration Fee: <span className="font-medium">${event.registration_fee}</span>
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}