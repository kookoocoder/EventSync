import Link from "next/link"
import { Calendar, Clock, Code, GraduationCap, MapPin, Trophy, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"

export default function HackathonDetailsPage({ params }) {
  // In a real app, you would fetch the hackathon data based on the ID
  const hackathon = {
    id: params.id,
    title: "AI Innovation Challenge",
    description:
      "Build the next generation of AI-powered applications that solve real-world problems. This hackathon brings together developers, designers, and AI enthusiasts to create innovative solutions using cutting-edge AI technologies.",
    image: "/placeholder.svg?height=600&width=1200",
    bannerImage: "/placeholder.svg?height=400&width=1200",
    date: "May 15-17, 2025",
    location: "Online",
    registrationDeadline: "Apr 30, 2025",
    participants: {
      registered: 120,
      maxCapacity: 200,
    },
    organizer: "TechInnovate Foundation",
    prizes: [
      {
        place: "1st Place",
        amount: "$10,000",
        description: "Cash prize plus mentorship opportunities",
      },
      {
        place: "2nd Place",
        amount: "$5,000",
        description: "Cash prize plus cloud credits",
      },
      {
        place: "3rd Place",
        amount: "$2,500",
        description: "Cash prize plus software licenses",
      },
    ],
    schedule: [
      {
        date: "May 15, 2025",
        time: "10:00 AM - 12:00 PM",
        event: "Opening Ceremony & Team Formation",
      },
      {
        date: "May 15, 2025",
        time: "12:00 PM",
        event: "Hacking Begins",
      },
      {
        date: "May 16, 2025",
        time: "2:00 PM - 4:00 PM",
        event: "Mentor Sessions",
      },
      {
        date: "May 17, 2025",
        time: "12:00 PM",
        event: "Hacking Ends",
      },
      {
        date: "May 17, 2025",
        time: "2:00 PM - 5:00 PM",
        event: "Project Presentations & Judging",
      },
      {
        date: "May 17, 2025",
        time: "6:00 PM - 7:00 PM",
        event: "Awards Ceremony",
      },
    ],
    rules: [
      "All code must be written during the hackathon",
      "Teams can consist of 1-5 members",
      "Projects must use at least one AI/ML technology",
      "Submissions must include source code and a demo video",
      "Participants must adhere to the code of conduct",
    ],
    judging: [
      {
        criteria: "Innovation & Creativity",
        weight: "30%",
        description: "Originality of the idea and creative problem-solving",
      },
      {
        criteria: "Technical Implementation",
        weight: "25%",
        description: "Quality of code, architecture, and technical complexity",
      },
      {
        criteria: "Impact & Practicality",
        weight: "20%",
        description: "Potential real-world impact and practical application",
      },
      {
        criteria: "User Experience",
        weight: "15%",
        description: "Design, usability, and overall user experience",
      },
      {
        criteria: "Presentation",
        weight: "10%",
        description: "Quality of demo, pitch, and documentation",
      },
    ],
    sponsors: ["TechCorp", "AI Solutions", "CloudScale", "DevTools Inc."],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <MainNav />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <img
            src={hackathon.bannerImage || "/placeholder.svg"}
            alt={hackathon.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 container py-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{hackathon.title}</h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{hackathon.date}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{hackathon.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>
                    {hackathon.participants.registered} / {hackathon.participants.maxCapacity} participants
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Registration closes: {hackathon.registrationDeadline}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              {/* Main Content */}
              <div className="flex-1 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Hackathon</CardTitle>
                    <CardDescription>Organized by {hackathon.organizer}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{hackathon.description}</p>
                  </CardContent>
                </Card>

                <Tabs defaultValue="schedule" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="prizes">Prizes</TabsTrigger>
                    <TabsTrigger value="rules">Rules</TabsTrigger>
                    <TabsTrigger value="judging">Judging</TabsTrigger>
                  </TabsList>

                  <TabsContent value="schedule" className="space-y-4 pt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {hackathon.schedule.map((item, index) => (
                            <div key={index} className="flex border-l-2 border-primary pl-4 pb-4 last:pb-0 relative">
                              <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary" />
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <h3 className="font-medium">{item.event}</h3>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>{item.date}</span>
                                    <Clock className="ml-4 mr-2 h-4 w-4" />
                                    <span>{item.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="prizes" className="space-y-4 pt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {hackathon.prizes.map((prize, index) => (
                            <div
                              key={index}
                              className={`rounded-lg p-6 ${
                                index === 0
                                  ? "bg-yellow-50 border border-yellow-200"
                                  : index === 1
                                    ? "bg-slate-50 border border-slate-200"
                                    : index === 2
                                      ? "bg-amber-50 border border-amber-200"
                                      : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`rounded-full p-2 ${
                                    index === 0
                                      ? "bg-yellow-100 text-yellow-700"
                                      : index === 1
                                        ? "bg-slate-100 text-slate-700"
                                        : index === 2
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-muted-foreground/20 text-muted-foreground"
                                  }`}
                                >
                                  <Trophy className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{prize.place}</h3>
                                  <p className="text-2xl font-bold">{prize.amount}</p>
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{prize.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="rules" className="space-y-4 pt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <ul className="space-y-2">
                          {hackathon.rules.map((rule, index) => (
                            <li key={index} className="flex items-start">
                              <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="judging" className="space-y-4 pt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {hackathon.judging.map((criteria, index) => (
                            <div
                              key={index}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 pb-4 border-b last:border-0 last:pb-0"
                            >
                              <div className="sm:w-1/3">
                                <h3 className="font-medium">{criteria.criteria}</h3>
                                <p className="text-sm text-muted-foreground">{criteria.weight}</p>
                              </div>
                              <div className="sm:w-2/3">
                                <p>{criteria.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="w-full md:w-80 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <Button className="w-full" size="lg">
                        Register for Hackathon
                      </Button>

                      <div className="rounded-lg bg-muted p-4">
                        <h3 className="font-medium mb-2">Registration Deadline</h3>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{hackathon.registrationDeadline}</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <h3 className="font-medium mb-2">Participants</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{hackathon.participants.registered} registered</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((hackathon.participants.registered / hackathon.participants.maxCapacity) * 100)}
                            % full
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted-foreground/20">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{
                              width: `${(hackathon.participants.registered / hackathon.participants.maxCapacity) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <Code className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Technical Skills</h3>
                        <p className="text-sm text-muted-foreground">Basic programming knowledge required</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Team Size</h3>
                        <p className="text-sm text-muted-foreground">1-5 members per team</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <GraduationCap className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Eligibility</h3>
                        <p className="text-sm text-muted-foreground">Open to all skill levels</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sponsors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {hackathon.sponsors.map((sponsor, index) => (
                        <div key={index} className="flex items-center justify-center h-16 rounded-md bg-muted p-2">
                          <span className="font-medium text-sm">{sponsor}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

