"use client"

import Link from "next/link"
import {
  BarChart3,
  Calendar,
  Clock,
  Edit,
  Eye,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash2,
  Trophy,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"

export default function OrganizerDashboard() {
  // Mock data for organizer's hackathons
  const activeHackathons = [
    {
      id: 1,
      title: "AI Innovation Challenge",
      description: "Build the next generation of AI-powered applications",
      image: "/placeholder.svg?height=400&width=600",
      date: "May 15-17, 2025",
      location: "Online",
      registrationDeadline: "Apr 30, 2025",
      participants: {
        registered: 120,
        approved: 98,
        pending: 22,
      },
      status: "Registration Open",
    },
    {
      id: 2,
      title: "Web3 Hackathon",
      description: "Create decentralized applications that shape the future",
      image: "/placeholder.svg?height=400&width=600",
      date: "Jun 5-7, 2025",
      location: "San Francisco, CA",
      registrationDeadline: "May 20, 2025",
      participants: {
        registered: 85,
        approved: 70,
        pending: 15,
      },
      status: "Registration Open",
    },
  ]

  const pastHackathons = [
    {
      id: 3,
      title: "Mobile App Challenge",
      description: "Design innovative mobile applications",
      image: "/placeholder.svg?height=400&width=600",
      date: "Mar 10-12, 2025",
      location: "Online",
      registrationDeadline: "Feb 28, 2025",
      participants: {
        registered: 150,
        approved: 130,
        pending: 0,
      },
      status: "Completed",
    },
  ]

  // Stats for the dashboard
  const stats = [
    {
      title: "Total Hackathons",
      value: "3",
      icon: Calendar,
    },
    {
      title: "Total Participants",
      value: "355",
      icon: Users,
    },
    {
      title: "Active Events",
      value: "2",
      icon: Clock,
    },
    {
      title: "Prize Money Awarded",
      value: "$15,000",
      icon: Trophy,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <MainNav />
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <span className="hidden sm:inline-block">John Organizer</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    JO
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
              <Link href="/organizer/create-event">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Hackathon
                </Button>
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

            <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">Active Hackathons</TabsTrigger>
                <TabsTrigger value="past">Past Hackathons</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-4 pt-4">
                {activeHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </TabsContent>
              <TabsContent value="past" className="space-y-4 pt-4">
                {pastHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} isPast />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

function HackathonCard({ hackathon, isPast = false }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 lg:w-1/5">
          <img
            src={hackathon.image || "/placeholder.svg"}
            alt={hackathon.title}
            className="h-full w-full object-cover aspect-video md:aspect-square"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{hackathon.title}</CardTitle>
                <CardDescription className="mt-1">{hackathon.description}</CardDescription>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit Hackathon
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Hackathon
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
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
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Deadline: {hackathon.registrationDeadline}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <p className="text-xs text-muted-foreground">Registered</p>
                <p className="text-xl font-bold">{hackathon.participants.registered}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-3 text-center">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-xl font-bold">{hackathon.participants.approved}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3 text-center">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{hackathon.participants.pending}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isPast ? "bg-muted text-muted-foreground" : "bg-green-100 text-green-800"
                }`}
              >
                {hackathon.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href={`/organizer/hackathons/${hackathon.id}/participants`}>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" /> Manage Participants
                </Button>
              </Link>
              <Link href={`/organizer/hackathons/${hackathon.id}/dashboard`}>
                <Button size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" /> Dashboard
                </Button>
              </Link>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}

