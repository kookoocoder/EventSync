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
  Coins,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/components/auth/AuthProvider";
import { PointsDisplay } from "./PointsDisplay";
import { Badge } from "@/components/ui/badge";

// Map of icon names to their components
const iconMap = {
  Calendar,
  Clock,
  Users,
  Award,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Coins
};

// Client component wrapper to handle client-side interactions like signout
export function ParticipantDashboardClient({ user, participantData, fetchError, registeredEvents, completedEvents, stats }: {
    user: any; 
    participantData: any;
    fetchError: string | null;
    registeredEvents: ParticipantEvent[];
    completedEvents: ParticipantEvent[];
    stats: any[]; 
}) {
    const { signOut } = useAuth();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto">
                    <SiteHeader />
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 container mx-auto py-6">
                {fetchError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-6">
                        <p>{fetchError}</p>
                        <div className="mt-4 flex gap-2">
                            <Button onClick={() => signOut()} variant="outline">
                                Sign Out
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Reload Page
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <Link href="/events">
                                <Button size="sm">
                                    Find Events
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map((stat, index) => {
                                const IconComponent = iconMap[stat.iconName as keyof typeof iconMap];
                                return (
                                    <Card key={index} className="border-0 shadow-sm">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                            </div>
                                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        
                        {/* Main panels section */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left column - Points */}
                            <div className="lg:col-span-1">
                                <PointsDisplay userId={user.id} />
                            </div>
                            
                            {/* Right columns - Events */}
                            <div className="lg:col-span-2">
                                <Card className="h-full border-0 shadow-sm">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Your Events</CardTitle>
                                            <Link href="/events">
                                                <Button variant="ghost" size="sm" className="h-8 gap-1">
                                                    <span className="text-xs">All Events</span>
                                                    <ArrowRight className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                        <CardDescription>Events you've registered for or completed</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Tabs defaultValue="registered" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="registered">Upcoming</TabsTrigger>
                                                <TabsTrigger value="completed">Completed</TabsTrigger>
                                            </TabsList>
                                            
                                            <TabsContent value="registered" className="p-4 space-y-4">
                                                {registeredEvents.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {registeredEvents.map((event) => (
                                                            <EventCard key={event.id} event={event} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <EmptyState 
                                                        message="No upcoming events" 
                                                        description="Register for events to see them here" 
                                                        action={<Link href="/events"><Button size="sm">Browse Events</Button></Link>}
                                                    />
                                                )}
                                            </TabsContent>
                                            
                                            <TabsContent value="completed" className="p-4 space-y-4">
                                                {completedEvents.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {completedEvents.map((event) => (
                                                            <EventCard key={event.id} event={event} isCompleted />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <EmptyState 
                                                        message="No completed events" 
                                                        description="Your past events will appear here" 
                                                    />
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        
                        {/* Profile section - Optional based on data */}
                        {participantData && (
                            <Card className="overflow-hidden border-0 shadow-sm">
                                <div className="flex items-center justify-between p-4">
                                    <div>
                                        <h3 className="font-medium">Your Profile</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {participantData.name || "Complete your profile"}
                                        </p>
                                    </div>
                                    <Link href="/participant/profile">
                                        <Button variant="outline" size="sm">
                                            {participantData.name ? "Edit Profile" : "Complete Profile"}
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

// Empty state component
function EmptyState({ message, description, action }: { 
    message: string, 
    description?: string,
    action?: React.ReactNode
}) {
    return (
        <div className="text-center py-6">
            <p className="font-medium text-muted-foreground">{message}</p>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

// Get status badge styles and icon based on status
function getStatusBadge(status: string) {
    if (status.toLowerCase().includes('registered')) {
        return {
            variant: 'success' as const,
            icon: <CheckCircle className="h-3 w-3 mr-1" />,
            label: 'Registered'
        };
    } else if (status.toLowerCase().includes('pending')) {
        return {
            variant: 'outline' as const,
            icon: <Timer className="h-3 w-3 mr-1" />,
            label: status
        };
    } else {
        return {
            variant: 'secondary' as const,
            icon: <AlertCircle className="h-3 w-3 mr-1" />,
            label: status
        };
    }
}

// Improved EventCard Component
function EventCard({ event, isCompleted = false }: {
    event: ParticipantEvent;
    isCompleted?: boolean;
}) {
    const statusBadge = getStatusBadge(event.status);
    const startDate = event.date.split(' - ')[0];
    
    return (
        <div className="group relative rounded-lg border border-border/80 hover:border-border bg-card transition-all">
            <div className="flex p-3">
                {event.image ? (
                    <div className="rounded-md overflow-hidden flex-shrink-0 w-20 h-20 mr-3">
                        <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full h-full object-cover" 
                        />
                    </div>
                ) : (
                    <div className="flex-shrink-0 bg-muted/30 rounded-md w-20 h-20 mr-3 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                )}
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-medium line-clamp-1">{event.title}</h3>
                            {!isCompleted && (
                                <Badge variant={statusBadge.variant as any} className="mt-1 text-xs">
                                    {statusBadge.icon}
                                    {statusBadge.label}
                                </Badge>
                            )}
                            {isCompleted && event.result && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                    <Award className="h-3 w-3 mr-1" />
                                    {event.result}
                                </Badge>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/events/${event.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                {event.teamName && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/events/${event.id}/team`}>Team Details</Link>
                                    </DropdownMenuItem>
                                )}
                                {isCompleted && (
                                    <DropdownMenuItem asChild>
                                        <Link href={`/events/${event.id}/certificate`}>View Certificate</Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{startDate}</span>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                        {event.teamName && (
                            <div className="flex items-center col-span-2">
                                <Users className="mr-1 h-3 w-3 flex-shrink-0" />
                                <span className="truncate">Team: {event.teamName}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Quick action buttons */}
            <div className="p-2 pt-0 flex justify-end border-t border-border/40 mt-2">
                <Link href={`/events/${event.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                        View Details
                        <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// Keep the interface
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