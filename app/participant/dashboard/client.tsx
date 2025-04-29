'use client';
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/components/auth/AuthProvider";

// Map of icon names to their components
const iconMap = {
  Calendar,
  Clock,
  Users,
  Award,
  ExternalLink,
  MapPin,
  MoreHorizontal
};

// Client component wrapper to handle client-side interactions like signout
export function ParticipantDashboardClient({ user, participantData, fetchError, registeredHackathons, completedHackathons, stats }: {
    user: any; // Type appropriately based on Auth.requireParticipant return
    participantData: any;
    fetchError: string | null;
    registeredHackathons: ParticipantEvent[];
    completedHackathons: ParticipantEvent[];
    stats: any[]; // Type appropriately
}) {
    const { signOut } = useAuth(); // Get signOut from client context

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <SiteHeader />
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                {fetchError ? ( // Changed variable name to fetchError
                    <div className="py-8">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-6">
                            <p>{fetchError}</p>
                            {/* Added buttons based on example error state */}
                            <div className="mt-4 flex gap-2">
                                <Button onClick={() => signOut()} variant="outline">
                                    Sign Out
                                </Button>
                                <Button onClick={() => window.location.reload()}>
                                    Reload Page
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold tracking-tight">Participant Dashboard</h1>
                                <Link href="/events">
                                    <Button>Find Events</Button>
                                </Link>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {stats.map((stat, index) => {
                                    // Get the icon component based on the iconName
                                    const IconComponent = iconMap[stat.iconName as keyof typeof iconMap];
                                    return (
                                        <Card key={index}>
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between space-y-0">
                                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                                    {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
                                                </div>
                                                <div className="mt-3">
                                                    <p className="text-3xl font-bold">{stat.value}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <Tabs defaultValue="registered" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="registered">Registered Events</TabsTrigger>
                                    <TabsTrigger value="completed">Completed Events</TabsTrigger>
                                </TabsList>
                                <TabsContent value="registered" className="space-y-4 pt-4">
                                     {registeredHackathons.length > 0 ? (
                                        registeredHackathons.map((event) => (
                                            <EventCard key={event.id} event={event} />
                                        ))
                                     ) : (
                                        <p className="text-muted-foreground text-center py-4">No registered events found.</p>
                                     )}
                                </TabsContent>
                                <TabsContent value="completed" className="space-y-4 pt-4">
                                     {completedHackathons.length > 0 ? (
                                        completedHackathons.map((event) => (
                                            <EventCard key={event.id} event={event} isCompleted />
                                        ))
                                     ) : (
                                         <p className="text-muted-foreground text-center py-4">No completed events found.</p>
                                     )}
                                </TabsContent>
                            </Tabs>

                            {/* Display profile info if fetched - updated structure */}
                             {participantData ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Your Profile Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {participantData.name && <p className="mb-1"><span className="font-medium">Name:</span> {participantData.name}</p>}
                                        {participantData.bio && <p className="mb-1 italic text-muted-foreground">"{participantData.bio}"</p>}
                                        {participantData.skills && participantData.skills.length > 0 ? (
                                            <p><span className="font-medium">Skills:</span> {participantData.skills.join(', ')}</p>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">No skills listed.</p>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Link href="/participant/profile">
                                            <Button variant="outline" size="sm">View/Edit Full Profile</Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                             ) : !fetchError && ( // Only show if no error and no data
                                <Card>
                                    <CardHeader><CardTitle>Complete Your Profile</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Finish setting up your participant profile to see your summary here.</p>
                                        <p className="text-xs text-muted-foreground mt-2">(Ensure you've added details in the 'participants' table associated with your user ID).</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Link href="/participant/profile">
                                            <Button variant="default" size="sm">Go to Profile</Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                             )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// --- EventCard Component (Updated from HackathonCard) ---
function EventCard({ event, isCompleted = false }: {
    event: ParticipantEvent;
    isCompleted?: boolean;
}) {
    // Card structure based on the provided example's internal structure
    return (
        <Card className="overflow-hidden">
            <div className="md:flex">
                {event.image && (
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
                    </div>
                )}
                <div className="p-6 md:w-2/3">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">{event.title}</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/events/${event.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                {event.teamName && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/teams/${event.teamName}`}>View Team</Link>
                                    </DropdownMenuItem>
                                )}
                                {isCompleted && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/events/${event.id}/certificate`}>View Certificate</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <a href="#" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Visit Event Site
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <p className="text-muted-foreground">{event.description}</p>
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            {event.date}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4" />
                            {event.location}
                        </div>
                        {event.teamName && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="mr-2 h-4 w-4" />
                                Team: {event.teamName} ({event.teamMembers} members)
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    isCompleted
                                        ? "bg-blue-50 text-blue-700"
                                        : event.status === "Registered"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-yellow-50 text-yellow-700"
                                }`}
                            >
                                {isCompleted
                                    ? event.result || "Completed"
                                    : event.status}
                            </span>
                        </div>
                        <Link href={`/events/${event.id}`}>
                            <Button variant="outline" size="sm">
                                {isCompleted ? "View Details" : "Manage Registration"}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    );
}

// --- ParticipantEvent Interface ---
interface ParticipantEvent {
    id: string;
    title: string;
    description: string;
    image?: string;
    date: string;
    location: string;
    status: string;
    teamName?: string | null;
    teamMembers?: number | string | null; 
    result?: string | null;
} 