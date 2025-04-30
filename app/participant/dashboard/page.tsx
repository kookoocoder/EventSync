// EventSync/app/participant/dashboard/page.tsx (UI Updated)
import Link from "next/link";
import {
  Calendar,
  Clock,
  Code,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Users,
  Award,
  Coins
} from "lucide-react";
import { Auth } from '@/lib/auth-server';
import { createServerComponentClient } from '@/lib/supabase/server';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { ParticipantDashboardClient } from './client';
import { format, isPast } from 'date-fns';
import { redirect } from "next/navigation";

// Simplified interface for fetched registration data
interface FetchedRegistration {
  id: string;
  status: string; 
  payment_status: string | null;
  registration_type: string;
  events: {
    id: string;
    name: string;
    description: string | null;
    banner_image: string | null;
    start_date: string;
    end_date: string;
    location: string | null;
  } | null;
  teams: {
    id: string;
    name: string;
  } | null;
}

// Interface for events passed to client component
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

export default async function ParticipantDashboardPage() {
    const user = await Auth.requireParticipant();
    const supabase = await createServerComponentClient();
    let participantData: any = null;
    let registeredEvents: ParticipantEvent[] = [];
    let completedEvents: ParticipantEvent[] = [];
    let stats: any[] = [];
    let fetchError: string | null = null;

    try {
        // Fetch participant profile
        const { data: profileData, error: profileError } = await supabase
            .from('participants')
            .select('name, bio, skills, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) throw profileError;
        participantData = profileData;

        // Fetch registrations with event and team details
        const { data: registrationData, error: registrationError } = await supabase
            .from('registrations')
            .select(`
                id,
                status,
                payment_status,
                registration_type,
                events ( id, name, description, banner_image, start_date, end_date, location ),
                teams ( id, name )
            `)
            .eq('participant_id', user.id)
            .order('created_at', { ascending: false });

        if (registrationError) throw registrationError;

        // Fetch blockchain points
        let pointsBalance = 0;
        try {
            // For server components, we need absolute URLs
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const apiUrl = new URL(`/api/blockchain/balance`, baseUrl);
            apiUrl.searchParams.append('participantId', user.id);
            
            const pointsResponse = await fetch(apiUrl.toString(), {
                headers: { 'Cache-Control': 'no-store' }
            });
            
            if (pointsResponse.ok) {
                const pointsData = await pointsResponse.json();
                pointsBalance = pointsData.balance || 0;
            }
        } catch (pointsError) {
            console.error("Error fetching points balance:", pointsError);
        }

        // Process registrations
        const now = new Date();
        registrationData.forEach((reg: FetchedRegistration) => {
            if (!reg.events) return;

            // Determine display status
            let displayStatus = 'Pending';
            if (reg.status === 'pending' && reg.payment_status === 'pending') {
                 displayStatus = 'Payment Pending';
            } else if (reg.status === 'pending') {
                displayStatus = 'Pending Approval';
            } else if (reg.status === 'approved') {
                displayStatus = 'Registered';
            } else if (reg.status === 'rejected') {
                displayStatus = 'Rejected';
            }

            const eventEndDate = new Date(reg.events.end_date);
            const isCompleted = isPast(eventEndDate);

            const formattedEvent: ParticipantEvent = {
                id: reg.events.id,
                title: reg.events.name,
                description: reg.events.description || 'No description available.',
                image: reg.events.banner_image || undefined,
                date: `${format(new Date(reg.events.start_date), 'MMM d, yyyy')} - ${format(eventEndDate, 'MMM d, yyyy')}`,
                location: reg.events.location || 'Online',
                status: displayStatus,
                teamName: reg.teams?.name,
                teamMembers: 'N/A',
                result: null,
            };

            if (isCompleted) {
                completedEvents.push(formattedEvent);
            } else {
                registeredEvents.push(formattedEvent);
            }
        });

        // Calculate stats
        const teamCount = registrationData.filter(reg => reg.teams !== null).length;
        const approvedCount = registrationData.filter(reg => reg.status === 'approved').length;
        stats = [
            { title: "Events", value: registrationData.length.toString(), iconName: "Calendar" },
            { title: "Upcoming", value: registeredEvents.length.toString(), iconName: "Clock" },
            { title: "Points", value: pointsBalance.toString(), iconName: "Coins" },
            { title: "Teams", value: teamCount.toString(), iconName: "Users" },
        ];

    } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        fetchError = `Failed to load data: ${err.message}`;
    }

    return (
        <ParticipantDashboardClient
            user={user}
            participantData={participantData}
            fetchError={fetchError}
            registeredEvents={registeredEvents}
            completedEvents={completedEvents}
            stats={stats}
        />
    );
}

// Removed duplicate ParticipantEvent interface and HackathonCard component
// The client component (client.tsx) now handles rendering

// --- HackathonCard Component (UI Updated based on example) ---
function HackathonCard({ hackathon, isCompleted = false }: {
    hackathon: ParticipantEvent;
    isCompleted?: boolean;
}) {
    // Card structure based on the provided example's internal structure
    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-1/4 lg:w-1/5 flex-shrink-0">
                    <img // Using standard img tag as per example structure
                        src={hackathon.image || "/placeholder.svg"}
                        alt={hackathon.title}
                        className="h-full w-full object-cover aspect-video md:aspect-square" // aspect-square for consistency
                    />
                </div>
                {/* Content Section */}
                <div className="flex flex-1 flex-col">
                    {/* Header with Title, Description, and Dropdown */}
                    <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                             <div className="flex-1">
                                <CardTitle>{hackathon.title}</CardTitle>
                                <CardDescription className="mt-1 line-clamp-2">{hackathon.description}</CardDescription>
                            </div>
                            {/* Dropdown Menu */}
                             <div className="flex-shrink-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/hackathons/${hackathon.id}`}>
                                                <ExternalLink className="mr-2 h-4 w-4" /> View Details
                                            </Link>
                                        </DropdownMenuItem>
                                        {!isCompleted && (
                                            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => alert('Withdraw functionality not implemented yet.')}>
                                                Withdraw Registration
                                            </DropdownMenuItem>
                                        )}
                                         {isCompleted && (
                                            <DropdownMenuItem asChild>
                                               <Link href={`/hackathons/${hackathon.id}/project`}> {/* Link to project view */}
                                                 View Project
                                               </Link>
                                            </DropdownMenuItem>
                                         )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    {/* Main Content with Details Grid */}
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center text-sm">
                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{hackathon.date}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{hackathon.location}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className={`mr-2 h-2 w-2 rounded-full flex-shrink-0 ${hackathon.status === "Registered" || hackathon.status === "Completed" ? "bg-green-500" : hackathon.status === "Pending Approval" ? "bg-amber-500" : "bg-muted"}`} />
                                <span>{hackathon.status}</span>
                            </div>
                        </div>
                        {/* Team Info */}
                        {hackathon.teamName && (
                            <div className="mt-4 rounded-lg bg-primary/10 p-3"> {/* bg-primary/10 from example */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Team: {hackathon.teamName}</p>
                                        <p className="text-xs text-muted-foreground">{hackathon.teamMembers} members</p>
                                    </div>
                                    {isCompleted && hackathon.result && (
                                        <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                            {hackathon.result}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                    {/* Footer with Buttons */}
                    <CardFooter className="flex justify-end mt-auto pt-4"> {/* Added mt-auto pt-4 */}
                        {isCompleted ? (
                            <Link href={`/hackathons/${hackathon.id}/project`}>
                                <Button variant="outline" size="sm">View Project</Button>
                            </Link>
                        ) : (
                            <div className="flex gap-2">
                                {hackathon.teamName ? (
                                    <Link href={`/hackathons/${hackathon.id}/team`}>
                                        <Button variant="outline" size="sm">
                                            <Users className="mr-2 h-4 w-4" /> Manage Team
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={`/hackathons/${hackathon.id}/register`}> {/* Link to register/join */}
                                        <Button variant="outline" size="sm">
                                            <Users className="mr-2 h-4 w-4" /> Join/Create Team
                                        </Button>
                                    </Link>
                                )}
                                <Link href={`/hackathons/${hackathon.id}`}>
                                    <Button size="sm">View Hackathon</Button>
                                </Link>
                            </div>
                        )}
                    </CardFooter>
                </div>
            </div>
        </Card>
    );
}