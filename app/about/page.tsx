import Link from "next/link"
import { ArrowRight, Award, Code, Globe, Lightbulb, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  // Mock team data
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      bio: "Former software engineer with a passion for community building and hackathons.",
      avatar: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Full-stack developer and hackathon enthusiast with 10+ years of experience.",
      avatar: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Michael Rodriguez",
      role: "Community Manager",
      bio: "Organized over 50 hackathons and passionate about fostering innovation.",
      avatar: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Emily Patel",
      role: "Design Lead",
      bio: "UX/UI designer focused on creating intuitive and accessible experiences.",
      avatar: "/placeholder.svg?height=200&width=200",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <MainNav />
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
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
        <section className="bg-muted py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                About HackSync
              </h1>
              <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Empowering innovators and creators through collaborative hackathons and coding challenges.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-2 md:gap-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
                <p className="mt-4 text-muted-foreground md:text-lg">
                  At HackSync, we believe in the power of collaboration and innovation. Our mission is to create a
                  platform where developers, designers, and creative thinkers can come together to solve real-world
                  problems, learn new skills, and build meaningful connections.
                </p>
                <p className="mt-4 text-muted-foreground md:text-lg">
                  We're dedicated to making hackathons accessible to everyone, regardless of experience level or
                  background. Whether you're a seasoned developer or just starting your coding journey, there's a place
                  for you in our community.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Team collaborating at a hackathon"
                  className="rounded-lg object-cover"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Our Values</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <Lightbulb className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Innovation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We foster creativity and out-of-the-box thinking to solve complex problems.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We believe in the power of diverse teams working together toward common goals.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Inclusivity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We create welcoming spaces where everyone can participate and contribute.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Code className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We encourage continuous growth and skill development through hands-on experiences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-4">Our Team</h2>
            <p className="text-center text-muted-foreground max-w-[700px] mx-auto mb-12 md:text-lg">
              Meet the passionate individuals behind HackSync who are dedicated to creating exceptional hackathon
              experiences.
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <Card key={index}>
                  <CardHeader className="text-center pb-2">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center">
              <Award className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-3xl font-bold tracking-tight">Our Impact</h2>
              <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Since our founding, we've helped thousands of innovators bring their ideas to life.
              </p>
              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                <div className="flex flex-col items-center">
                  <p className="text-4xl font-bold">500+</p>
                  <p className="text-muted-foreground">Hackathons Hosted</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-4xl font-bold">50,000+</p>
                  <p className="text-muted-foreground">Participants</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-4xl font-bold">$2M+</p>
                  <p className="text-muted-foreground">In Prizes Awarded</p>
                </div>
              </div>
              <div className="mt-12">
                <Link href="/hackathons">
                  <Button size="lg">
                    Join Our Community <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
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

