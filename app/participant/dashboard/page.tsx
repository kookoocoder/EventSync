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
import { useAuth } from "@/components/auth/AuthProvider"; 

// Client component wrapper to handle client-side interactions like signout
function ParticipantDashboardClient({ user, participantData, fetchError, registeredHackathons, completedHackathons, stats }: {
    user: any; // Type appropriately based on Auth.requireParticipant return
    participantData: any;
    fetchError: string | null;
    registeredHackathons: ParticipantHackathon[];
    completedHackathons: ParticipantHackathon[];
    stats: any[]; // Type appropriately
}) {
    const { signOut } = useAuth(); // Get signOut from client context

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <SiteHeader />
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-1">
                                    <span className="hidden sm:inline-block">{user?.user_metadata?.name || "User"}</span>
                                    {/* Using a simple div for avatar based on example */}
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                        {user?.user_metadata?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href="/participant/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/participant/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
                {fetchError ? ( // Changed variable name to fetchError
                    <div className="container py-8">
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
                    <div className="container py-8">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold tracking-tight">Participant Dashboard</h1>
                                <Link href="/hackathons">
                                    <Button>Find Hackathons</Button>
                                </Link>
                            </div>

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

                            <Tabs defaultValue="registered" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="registered">Registered Hackathons</TabsTrigger>
                                    <TabsTrigger value="completed">Completed Hackathons</TabsTrigger>
                                </TabsList>
                                <TabsContent value="registered" className="space-y-4 pt-4">
                                     {registeredHackathons.length > 0 ? (
                                        registeredHackathons.map((hackathon) => (
                                            <HackathonCard key={hackathon.id} hackathon={hackathon} />
                                        ))
                                     ) : (
                                        <p className="text-muted-foreground text-center py-4">No registered hackathons found.</p>
                                     )}
                                </TabsContent>
                                <TabsContent value="completed" className="space-y-4 pt-4">
                                     {completedHackathons.length > 0 ? (
                                        completedHackathons.map((hackathon) => (
                                            <HackathonCard key={hackathon.id} hackathon={hackathon} isCompleted />
                                        ))
                                     ) : (
                                         <p className="text-muted-foreground text-center py-4">No completed hackathons found.</p>
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


export default async function ParticipantDashboardPage() {
    // --- Server-side data fetching ---
    const user = await Auth.requireParticipant();
    const supabase = createServerComponentClient();
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
     const registeredHackathons: ParticipantHackathon[] = [
        { id: "1", title: "AI Innovation Challenge", description: "Build the next generation of AI-powered applications", image: "/placeholder.svg?height=400&width=600", date: "May 15-17, 2025", location: "Online", status: "Registered", teamName: "AI Innovators", teamMembers: 4 },
        { id: "2", title: "Web3 Hackathon", description: "Create decentralized applications that shape the future", image: "/placeholder.svg?height=400&width=600", date: "Jun 5-7, 2025", location: "San Francisco, CA", status: "Pending Approval", teamName: null, teamMembers: null },
    ];
    const completedHackathons: ParticipantHackathon[] = [
        { id: "3", title: "Mobile App Challenge", description: "Design innovative mobile applications", image: "/placeholder.svg?height=400&width=600", date: "Mar 10-12, 2025", location: "Online", status: "Completed", teamName: "App Wizards", teamMembers: 3, result: "Honorable Mention" },
    ];
    const stats = [
        { title: "Hackathons Joined", value: "3", icon: Calendar },
        { title: "Upcoming Events", value: "2", icon: Clock },
        { title: "Team Members", value: "7", icon: Users },
        { title: "Projects Built", value: "4", icon: Code },
    ];
    // --- End Mock Data ---

    // Pass server-fetched data and mocks to the client component
    return (
        <ParticipantDashboardClient
            user={user}
            participantData={participantData}
            fetchError={fetchError}
            registeredHackathons={registeredHackathons}
            completedHackathons={completedHackathons}
            stats={stats}
        />
    );
}


// --- ParticipantHackathon Interface ---
interface ParticipantHackathon {
    id: string;
    title: string;
    description: string;
    image?: string;
    date: string;
    location: string;
    status: string;
    teamName?: string | null;
    teamMembers?: number | string | null; // Keeping union type as per original
    result?: string | null;
}

// --- HackathonCard Component (UI Updated based on example) ---
function HackathonCard({ hackathon, isCompleted = false }: {
    hackathon: ParticipantHackathon;
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