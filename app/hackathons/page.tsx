import Link from "next/link"
import { ArrowRight, Calendar, Filter, MapPin, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/SiteHeader"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function HackathonsPage() {
  // Mock data for hackathons
  const upcomingHackathons = [
    {
      id: "1",
      title: "AI Innovation Challenge",
      description: "Build the next generation of AI-powered applications",
      image: "/placeholder.svg?height=400&width=600",
      date: "May 15-17, 2025",
      location: "Online",
      participants: 120,
      registrationDeadline: "Apr 30, 2025",
      tags: ["AI", "Machine Learning", "Innovation"],
      registrationFee: 25,
    },
    {
      id: "2",
      title: "Web3 Hackathon",
      description: "Create decentralized applications that shape the future",
      image: "/placeholder.svg?height=400&width=600",
      date: "Jun 5-7, 2025",
      location: "San Francisco, CA",
      participants: 200,
      registrationDeadline: "May 20, 2025",
      tags: ["Blockchain", "Web3", "DeFi"],
      registrationFee: 15,
    },
    {
      id: "3",
      title: "Climate Tech Challenge",
      description: "Develop solutions to combat climate change",
      image: "/placeholder.svg?height=400&width=600",
      date: "Jul 10-12, 2025",
      location: "Hybrid",
      participants: 150,
      registrationDeadline: "Jun 25, 2025",
      tags: ["CleanTech", "Sustainability", "Innovation"],
      registrationFee: 0,
    },
  ]

  const liveHackathons = [
    {
      id: "4",
      title: "GameDev Jam",
      description: "Create an innovative game in 48 hours",
      image: "/placeholder.svg?height=400&width=600",
      date: "Apr 4-6, 2025",
      location: "Online",
      participants: 85,
      registrationDeadline: "Apr 3, 2025",
      tags: ["Gaming", "Game Development", "Design"],
      registrationFee: 10,
    },
  ]

  const pastHackathons = [
    {
      id: "5",
      title: "Health Tech Summit",
      description: "Revolutionize healthcare with technology",
      image: "/placeholder.svg?height=400&width=600",
      date: "Mar 15-17, 2025",
      location: "Boston, MA",
      participants: 175,
      registrationDeadline: "Mar 1, 2025",
      tags: ["Healthcare", "MedTech", "Innovation"],
      registrationFee: 20,
    },
    {
      id: "6",
      title: "Fintech Disrupt",
      description: "Reimagine financial services for the digital age",
      image: "/placeholder.svg?height=400&width=600",
      date: "Feb 20-22, 2025",
      location: "New York, NY",
      participants: 210,
      registrationDeadline: "Feb 5, 2025",
      tags: ["Fintech", "Banking", "Payments"],
      registrationFee: 30,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
          <SiteHeader />
      <main className="flex-1">
        <section className="bg-muted py-12 md:py-16">
          <div className="container">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Discover Hackathons</h1>
              <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Find the perfect hackathon to showcase your skills, learn new technologies, and connect with like-minded
                innovators.
              </p>
              <div className="mt-8 flex w-full max-w-md flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search hackathons..." className="pl-8" />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] shrink-0">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hackathons</SelectItem>
                    <SelectItem value="online">Online Only</SelectItem>
                    <SelectItem value="in-person">In-Person Only</SelectItem>
                    <SelectItem value="free">Free Registration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Browse Hackathons</h2>
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="live">Live Now</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="upcoming" className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="live" className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {liveHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} isLive />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="past" className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} isPast />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} HackSync. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="/contact" className="hover:underline underline-offset-4">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Define the type for the hackathon prop
interface Hackathon {
  id: string
  title: string
  description: string
  image?: string
  date: string
  location: string
  participants: number | string
  registrationDeadline: string
  tags: string[]
  registrationFee: number
}

function HackathonCard({ hackathon, isLive = false, isPast = false }: {
  hackathon: Hackathon // Apply the type here
  isLive?: boolean
  isPast?: boolean
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        {isLive && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full z-20 animate-pulse">
            Live Now
          </div>
        )}
        {hackathon.registrationFee === 0 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full z-20">
            Free Entry
          </div>
        )}
        <img
          src={hackathon.image || "/placeholder.svg"}
          alt={hackathon.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute bottom-3 left-3 z-10">
          {hackathon.tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-block bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full mr-2"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{hackathon.title}</CardTitle>
        <CardDescription className="line-clamp-2">{hackathon.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{hackathon.date}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{hackathon.location}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            <span>{hackathon.participants} participants</span>
          </div>
          {hackathon.registrationFee > 0 && (
            <div className="flex items-center font-medium">
              <Badge variant="outline" className="mr-2">
                ${hackathon.registrationFee}
              </Badge>
              <span className="text-xs text-muted-foreground">Registration Fee</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isPast ? (
          <Button variant="outline" className="w-full">
            View Results
          </Button>
        ) : (
          <Link href={`/hackathons/${hackathon.id}/register`} className="w-full">
            <Button className="w-full">
              {isLive ? "Join Now" : "Register"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}

