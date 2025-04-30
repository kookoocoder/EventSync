"use client";

import React, { useState, useEffect } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createServerComponentClient } from "@/lib/supabase/server";
import { Calendar, Clock, Code, GraduationCap, MapPin, Trophy, Users, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import QRCode from 'qrcode';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { RegistrationButton } from "@/components/RegistrationButton";

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

export default async function EventPage({ 
  params: { id } 
}: { 
  params: { id: string } 
}) {
  // Use id directly from destructured params
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedQRCode, setGeneratedQRCode] = useState<string | null>(null);

  // Function to generate QR code from UPI ID and amount
  const generateQRCode = async (upiId: string, amount: string) => {
    try {
      // Create UPI payment URL
      const upiUrl = `upi://pay?pa=${upiId}&am=${amount}&cu=INR`;
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 192, // Smaller size for the details page
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  useEffect(() => {
    // Fetch event data
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch event: ${response.statusText}`);
        }
        const eventData = await response.json();
        setEvent(eventData);
        
        // Generate QR code if this is a paid event with UPI ID
        if (eventData.registration_fee > 0 && eventData.upi_id) {
          const qrCode = await generateQRCode(eventData.upi_id, eventData.registration_fee.toString());
          setGeneratedQRCode(qrCode);
        }
      } catch (error: any) {
        console.error("Error loading event:", error);
        setError(error.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const supabase = await createServerComponentClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
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

        <div className="container py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
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
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Registration</CardTitle>
                  {event.registration_end_date && (
                    <CardDescription>
                      Closes on {format(new Date(event.registration_end_date), "MMMM d, yyyy")}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isRegistrationOpen() && (
                    <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Registration {event.registration_end_date && new Date(event.registration_end_date) < new Date() ? "Closed" : "Not Open Yet"}</h3>
                          <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                            <p>
                              {event.registration_end_date && new Date(event.registration_end_date) < new Date()
                                ? "The registration deadline has passed."
                                : event.registration_start_date && new Date(event.registration_start_date) > new Date()
                                ? `Registration opens on ${format(new Date(event.registration_start_date), "MMMM d, yyyy")}.`
                                : "Registration is currently not available."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replace the getRegistrationButton() with our component */}
                  <RegistrationButton 
                    eventId={id} 
                    isLive={isLiveEvent()} 
                    isPast={isPastEvent()} 
                    buttonSize="lg"
                  />

                  {event.registration_fee > 0 && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-muted-foreground">
                        Registration Fee: ${event.registration_fee}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ... other sidebar components ... */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}