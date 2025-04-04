"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Trophy, Users, Clock, DollarSign } from "lucide-react"

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>()
  const eventId = params.id
  
  // Mock data - replace with Supabase data
  const eventData = {
    id: eventId,
    name: "AI Hackathon 2024",
    description: "A global hackathon for AI enthusiasts to build innovative solutions. Join us for an exciting weekend of coding, collaboration, and innovation. Participants will work in teams to develop AI-powered applications that solve real-world problems. Mentors from leading tech companies will be available to provide guidance throughout the event.",
    startDate: "2024-06-15",
    endDate: "2024-06-16",
    location: "Online",
    registrationFee: 0,
    maxParticipants: 200,
    currentParticipants: 75,
    registrationEndDate: "2024-06-10",
    isPublished: true,
    prizeMoney: "$5000",
    bannerImage: "https://placehold.co/1200x400?text=AI+Hackathon+2024",
    organizer: "Tech Innovation Labs",
    rules: [
      "Teams can have 1-5 members",
      "All code must be written during the hackathon",
      "Participants can use any programming language or framework",
      "Projects must be submitted before the deadline",
      "Submissions will be judged based on innovation, technical difficulty, and design"
    ],
    timeline: [
      { time: "June 15, 9:00 AM", event: "Opening Ceremony" },
      { time: "June 15, 10:00 AM", event: "Hacking Starts" },
      { time: "June 15, 2:00 PM", event: "Workshop: AI Fundamentals" },
      { time: "June 16, 12:00 PM", event: "Submission Deadline" },
      { time: "June 16, 3:00 PM", event: "Judging" },
      { time: "June 16, 5:00 PM", event: "Awards Ceremony" }
    ],
    prizes: [
      { place: "1st Place", prize: "$3000" },
      { place: "2nd Place", prize: "$1500" },
      { place: "3rd Place", prize: "$500" }
    ]
  }
  
  const daysUntilRegistrationEnd = () => {
    const today = new Date()
    const endDate = new Date(eventData.registrationEndDate)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
        <Image
          src={eventData.bannerImage}
          alt={eventData.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{eventData.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {eventData.registrationFee === 0 ? (
              <Badge className="bg-green-500">Free</Badge>
            ) : (
              <Badge><DollarSign className="h-3 w-3 mr-1" />{eventData.registrationFee}</Badge>
            )}
            <Badge variant="outline" className="text-white border-white">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(eventData.startDate).toLocaleDateString()} - {new Date(eventData.endDate).toLocaleDateString()}
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              <MapPin className="h-3 w-3 mr-1" />
              {eventData.location}
            </Badge>
          </div>
          <div className="flex gap-3 mt-2">
            <Button asChild size="lg">
              <Link href={`/hackathons/${eventId}/register`}>Register Now</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 text-white hover:bg-white/20 hover:text-white">
              Share
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Event</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <p>{eventData.description}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {eventData.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData.timeline.map((item, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      {index < eventData.timeline.length - 1 && <div className="h-full w-0.5 bg-border"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">{item.event}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(eventData.startDate).toLocaleDateString()} - {new Date(eventData.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{eventData.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Participants</p>
                  <p className="text-sm text-muted-foreground">
                    {eventData.currentParticipants} / {eventData.maxParticipants}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Registration Deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(eventData.registrationEndDate).toLocaleDateString()}
                    {daysUntilRegistrationEnd() > 0 && (
                      <span className="text-red-500 ml-1">({daysUntilRegistrationEnd()} days left)</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Registration Fee</p>
                  <p className="text-sm text-muted-foreground">
                    {eventData.registrationFee === 0 ? "Free" : `$${eventData.registrationFee}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Prizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData.prizes.map((prize, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' : 
                      index === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : 
                      'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
                    }`}>
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{prize.place}</p>
                      <p className="text-sm text-muted-foreground">{prize.prize}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Organized By</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                {eventData.organizer.slice(0, 2)}
              </div>
              <div>
                <p className="font-medium">{eventData.organizer}</p>
                <p className="text-sm text-muted-foreground">Event Organizer</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

