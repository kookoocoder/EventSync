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
} from "lucide-react";
import { Auth } from '@/lib/auth-server';
import { createServerComponentClient } from '@/lib/supabase/server';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { ParticipantDashboardClient } from './client';

export default async function ParticipantDashboardPage() {
    // --- Server-side data fetching ---
    const user = await Auth.requireParticipant();
    const supabase = await createServerComponentClient();
    let participantData: any = null;
    let fetchError: string | null = null;

    try {
        const { data, error } = await supabase
            .from('participants')
            .select('name, bio, skills, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching participant data:", error);
            fetchError = `Failed to load participant data: ${error.message}`;
        } else {
            participantData = data;
        }
    } catch (err: any) {
        console.error("Caught unexpected error during participant data fetch:", err.message || err);
        fetchError = `An unexpected error occurred while loading profile data.`;
    }

    // --- Mock Data (Keep for now) ---
     const registeredEvents: ParticipantEvent[] = [
        { id: "1", title: "AI Innovation Challenge", description: "Build the next generation of AI-powered applications", image: "/placeholder.svg?height=400&width=600", date: "May 15-17, 2025", location: "Online", status: "Registered", teamName: "AI Innovators", teamMembers: 4 },
        { id: "2", title: "Web3 Hackathon", description: "Create decentralized applications that shape the future", image: "/placeholder.svg?height=400&width=600", date: "Jun 5-7, 2025", location: "San Francisco, CA", status: "Pending Approval", teamName: null, teamMembers: null },
    ];
    const completedEvents: ParticipantEvent[] = [
        { id: "3", title: "Mobile App Challenge", description: "Design innovative mobile applications", image: "/placeholder.svg?height=400&width=600", date: "Mar 10-12, 2025", location: "Online", status: "Completed", teamName: "App Wizards", teamMembers: 3, result: "Honorable Mention" },
    ];
    const stats = [
        { title: "Events Joined", value: "3", iconName: "Calendar" },
        { title: "Upcoming Events", value: "2", iconName: "Clock" },
        { title: "Team Members", value: "7", iconName: "Users" },
    ];
    // --- End Mock Data ---

    // Pass server-fetched data and mocks to the client component
    return (
        <ParticipantDashboardClient
            user={user}
            participantData={participantData}
            fetchError={fetchError}
            registeredHackathons={registeredEvents}
            completedHackathons={completedEvents}
            stats={stats}
        />
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