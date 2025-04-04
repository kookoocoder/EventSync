"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Eye, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegistrationsPage({ params }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  // Mock user data
  const user = {
    name: "John Organizer",
    avatar: "/placeholder.svg?height=200&width=200",
  }

  // Mock hackathon data
  const hackathon = {
    id: params.id,
    title: "AI Innovation Challenge",
    registrationFee: 25,
  }

  // Mock registrations data
  const registrations = {
    pending: [
      {
        id: "reg-1",
        participant: {
          name: "Alex Johnson",
          email: "alex@example.com",
          avatar: "/placeholder.svg?height=200&width=200",
          phone: "+1 (555) 123-4567",
        },
        registrationDate: "2025-04-01T14:30:00Z",
        teamName: "AI Wizards",
        teamSize: 3,
        paymentScreenshot: "/placeholder.svg?height=600&width=400",
        transactionId: "TXN123456789",
        status: "pending",
      },
      {
        id: "reg-2",
        participant: {
          name: "Emily Chen",
          email: "emily@example.com",
          avatar: "/placeholder.svg?height=200&width=200",
          phone: "+1 (555) 987-6543",
        },
        registrationDate: "2025-04-02T09:15:00Z",
        teamName: null,
        teamSize: null,
        paymentScreenshot: "/placeholder.svg?height=600&width=400",
        transactionId: "TXN987654321",
        status: "pending",
      },
    ],
    approved: [
      {
        id: "reg-3",
        participant: {
          name: "Michael Smith",
          email: "michael@example.com",
          avatar: "/placeholder.svg?height=200&width=200",
          phone: "+1 (555) 456-7890",
        },
        registrationDate: "2025-03-30T11:45:00Z",
        teamName: "Code Masters",
        teamSize: 4,
        paymentScreenshot: "/placeholder.svg?height=600&width=400",
        transactionId: "TXN456789123",
        status: "approved",
        approvedDate: "2025-03-31T10:20:00Z",
      },
    ],
    rejected: [
      {
        id: "reg-4",
        participant: {
          name: "Sarah Williams",
          email: "sarah@example.com",
          avatar: "/placeholder.svg?height=200&width=200",
          phone: "+1 (555) 789-0123",
        },
        registrationDate: "2025-03-29T16:10:00Z",
        teamName: "Tech Innovators",
        teamSize: 2,
        paymentScreenshot: "/placeholder.svg?height=600&width=400",
        transactionId: "TXN789012345",
        status: "rejected",
        rejectedDate: "2025-03-30T09:05:00Z",
        rejectionReason: "Payment verification failed",
      },
    ],
  }

  const handleViewRegistration = (registration) => {
    setSelectedRegistration(registration)
  }

  const handleApproveRegistration = () => {
    setIsApproving(true)

    // Simulate API call
    setTimeout(() => {
      setIsApproving(false)
      setSelectedRegistration(null)
      // In a real app, you would update the registration status
    }, 1000)
  }

  const handleRejectRegistration = () => {
    setIsRejecting(true)

    // Simulate API call
    setTimeout(() => {
      setIsRejecting(false)
      setSelectedRegistration(null)
      // In a real app, you would update the registration status
    }, 1000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <MainNav />
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <span className="hidden sm:inline-block">{user.name}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>JO</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/organizer/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/organizer/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/organizer/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center">
              <Link href="/organizer/dashboard" className="mr-4">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Registrations</h1>
                <p className="text-muted-foreground">{hackathon.title}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  placeholder="Search participants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="icon" variant="ghost">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>All Registrations</DropdownMenuItem>
                    <DropdownMenuItem>Individual Participants</DropdownMenuItem>
                    <DropdownMenuItem>Team Registrations</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Select defaultValue="date-desc">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
              <TabsList>
                <TabsTrigger value="pending" className="relative">
                  Pending
                  <Badge className="ml-2 bg-amber-500 hover:bg-amber-500/80">{registrations.pending.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="approved" className="relative">
                  Approved
                  <Badge className="ml-2 bg-green-500 hover:bg-green-500/80">{registrations.approved.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="relative">
                  Rejected
                  <Badge className="ml-2 bg-red-500 hover:bg-red-500/80">{registrations.rejected.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 pt-4">
                {registrations.pending.map((registration) => (
                  <RegistrationCard key={registration.id} registration={registration} onView={handleViewRegistration} />
                ))}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4 pt-4">
                {registrations.approved.map((registration) => (
                  <RegistrationCard key={registration.id} registration={registration} onView={handleViewRegistration} />
                ))}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 pt-4">
                {registrations.rejected.map((registration) => (
                  <RegistrationCard key={registration.id} registration={registration} onView={handleViewRegistration} />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Registration Details Dialog */}
      {selectedRegistration && (
        <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Registration Details</DialogTitle>
              <DialogDescription>Review participant information and payment details</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium mb-4">Participant Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={selectedRegistration.participant.avatar}
                        alt={selectedRegistration.participant.name}
                      />
                      <AvatarFallback>
                        {selectedRegistration.participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedRegistration.participant.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedRegistration.participant.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <p>{selectedRegistration.participant.phone}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Registration Date</Label>
                    <p>{formatDate(selectedRegistration.registrationDate)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Team Information</Label>
                    {selectedRegistration.teamName ? (
                      <div>
                        <p>Team Name: {selectedRegistration.teamName}</p>
                        <p className="text-sm text-muted-foreground">
                          Team Size: {selectedRegistration.teamSize} members
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Individual Participant</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Registration Status</Label>
                    <div>
                      {selectedRegistration.status === "pending" && (
                        <Badge className="bg-amber-500 hover:bg-amber-500/80">Pending</Badge>
                      )}
                      {selectedRegistration.status === "approved" && (
                        <Badge className="bg-green-500 hover:bg-green-500/80">Approved</Badge>
                      )}
                      {selectedRegistration.status === "rejected" && (
                        <Badge className="bg-red-500 hover:bg-red-500/80">Rejected</Badge>
                      )}

                      {selectedRegistration.status === "approved" && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Approved on {formatDate(selectedRegistration.approvedDate)}
                        </p>
                      )}

                      {selectedRegistration.status === "rejected" && (
                        <div className="mt-1">
                          <p className="text-sm text-muted-foreground">
                            Rejected on {formatDate(selectedRegistration.rejectedDate)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Reason: {selectedRegistration.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Registration Fee</Label>
                    <p>${hackathon.registrationFee}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Transaction ID</Label>
                    <p>{selectedRegistration.transactionId}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Screenshot</Label>
                    <div className="rounded-lg border overflow-hidden">
                      <img
                        src={selectedRegistration.paymentScreenshot || "/placeholder.svg"}
                        alt="Payment Screenshot"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedRegistration.status === "pending" && (
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="destructive" onClick={handleRejectRegistration} disabled={isRejecting}>
                  {isRejecting ? "Rejecting..." : "Reject Registration"}
                </Button>
                <Button onClick={handleApproveRegistration} disabled={isApproving}>
                  {isApproving ? "Approving..." : "Approve Registration"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function RegistrationCard({ registration, onView }) {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row">
        <CardContent className="p-6 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={registration.participant.avatar} alt={registration.participant.name} />
                <AvatarFallback>
                  {registration.participant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{registration.participant.name}</h3>
                <p className="text-sm text-muted-foreground">{registration.participant.email}</p>
              </div>
            </div>
            <div>
              {registration.status === "pending" && (
                <Badge className="bg-amber-500 hover:bg-amber-500/80">Pending</Badge>
              )}
              {registration.status === "approved" && (
                <Badge className="bg-green-500 hover:bg-green-500/80">Approved</Badge>
              )}
              {registration.status === "rejected" && <Badge className="bg-red-500 hover:bg-red-500/80">Rejected</Badge>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Registration Date</p>
              <p className="text-sm">{new Date(registration.registrationDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              <p className="text-sm">{registration.teamName || "Individual Participant"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="text-sm font-mono">{registration.transactionId}</p>
            </div>
          </div>
        </CardContent>
        <div className="flex items-center justify-end p-4 sm:border-l">
          <Button variant="outline" size="sm" onClick={() => onView(registration)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>
      </div>
    </Card>
  )
}

