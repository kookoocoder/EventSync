"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Eye, Filter, Search, Check, X, RefreshCw } from "lucide-react"
import { format } from 'date-fns' // Use date-fns for formatting
import React from "react" // Needed for React.use?

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton" // Added for loading state

// Import the server actions
import {
  approveRegistrationAction,
  rejectRegistrationAction,
  fetchEventRegistrations,
} from "./actions"

// Type Definitions (Keep or move to a types file)
export interface RegistrationUI {
  id: string
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  registrationDate: string
  status: "pending" | "approved" | "rejected"
  answers: Record<string, string>
  questions: Record<string, { question_text: string, question_type: string }>
}

type RegistrationStatus = "pending" | "approved" | "rejected" | "all"

// Helper function (can be kept here or moved to utils)
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Props for the Client Component
interface RegistrationsClientProps {
  event: { id: string; name: string } | null; // Pass event details
  initialRegistrations: RegistrationUI[] | null; // Pass processed registrations
  fetchError: string | null; // Pass any fetching error
}

export function RegistrationsClient({
  event,
  initialRegistrations,
  fetchError,
}: RegistrationsClientProps) {
  const [registrations, setRegistrations] = useState<RegistrationUI[]>([])
  const [isLoading, setIsLoading] = useState(true) // Track initial loading
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("date_desc") // Default sort
  const [filterOption, setFilterOption] = useState<RegistrationStatus>("all")
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationUI | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false);


  // Process initialRegistrations prop on mount
  useEffect(() => {
    if (initialRegistrations) {
      setRegistrations(initialRegistrations);
      setIsLoading(false); // Data is loaded
    } else if (fetchError) {
        setIsLoading(false); // Error occurred during fetch
        // Optionally show an error message based on fetchError
    } else {
        // Handle case where props might be initially undefined/null if fetching is slow
        // setIsLoading(true); // Keep loading until props arrive
    }
  }, [initialRegistrations, fetchError]);

  // Function to refresh registrations data
  const refreshRegistrations = async () => {
    if (!event?.id) return;
    
    setIsRefreshing(true);
    try {
      const result = await fetchEventRegistrations(event.id);
      if (result.success && result.registrations) {
        setRegistrations(result.registrations);
      } else {
        console.error("Failed to refresh registrations:", result.error);
      }
    } catch (error) {
      console.error("Error refreshing registrations:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // --- Filtering and Sorting Logic ---
  const filteredRegistrations = useMemo(() => {
    let filtered = registrations

    // Filter by status
    if (filterOption !== "all") {
      filtered = filtered.filter((reg) => reg.status === filterOption)
    }

    // Filter by search query (name or email)
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (reg) =>
          reg.name.toLowerCase().includes(lowerCaseQuery) ||
          reg.email.toLowerCase().includes(lowerCaseQuery)
      )
    }

    return filtered
  }, [registrations, filterOption, searchQuery])

  const sortedAndFilteredRegistrations = useMemo(() => {
    let sorted = [...filteredRegistrations] // Create a new array

    switch (sortOption) {
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "date_asc":
        sorted.sort(
          (a, b) =>
            new Date(a.registrationDate).getTime() -
            new Date(b.registrationDate).getTime()
        )
        break
      case "date_desc":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.registrationDate).getTime() -
            new Date(a.registrationDate).getTime()
        )
        break
    }
    return sorted
  }, [filteredRegistrations, sortOption])

  // --- Handlers ---
  const handleApprove = async (registrationId: string) => {
    if (!event?.id) return;
    setIsApproving(true)
    try {
      // Call the server action to approve the registration
      await approveRegistrationAction(event.id, registrationId);
      
      // Option 1: Update locally
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, status: "approved" } : reg
        )
      );
      
      // Option 2: Refresh data from server to ensure consistency
      await refreshRegistrations();
      
      // Optional: Show success toast/message
    } catch (error) {
      console.error("Failed to approve registration:", error)
      // Optional: Show error toast/message
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = (registration: RegistrationUI) => {
    setSelectedRegistration(registration)
    setRejectionReason("") // Clear previous reason
    setIsRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedRegistration || !event?.id) return
    setIsRejecting(true)
    try {
      // Call the server action to reject the registration
      await rejectRegistrationAction(event.id, selectedRegistration.id, rejectionReason);
      
      // Option 1: Update locally
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === selectedRegistration.id
            ? { ...reg, status: "rejected", rejectionReason: rejectionReason }
            : reg
        )
      );
      
      // Option 2: Refresh data from server to ensure consistency
      await refreshRegistrations();
      
      setIsRejectDialogOpen(false)
      setSelectedRegistration(null)
      // Optional: Show success toast/message
    } catch (error) {
      console.error("Failed to reject registration:", error)
      // Optional: Show error toast/message
    } finally {
      setIsRejecting(false)
    }
  }

  const handleViewDetails = (registration: RegistrationUI) => {
    setSelectedRegistration(registration)
    // The dialog will open based on selectedRegistration not being null
  }

  const handleCloseDetails = () => {
    setSelectedRegistration(null)
  }

   const handleCloseRejectDialog = () => {
    setIsRejectDialogOpen(false);
    // Keep selectedRegistration if the main details dialog should remain open after cancelling rejection
    // If cancelling rejection should also close details, uncomment the line below:
    // setSelectedRegistration(null);
  };

  // --- Render Logic ---

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">Error loading registrations: {fetchError}</p>
        <Link href="/organizer/events">
            <Button variant="outline">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Events
            </Button>
        </Link>
      </div>
    );
  }


  // Loading state using skeletons
  const renderSkeletons = (count = 5) => (
    Array.from({ length: count }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
        </TableCell>
        <TableCell>
           <Skeleton className="h-4 w-[100px]" />
        </TableCell>
        <TableCell>
           <Skeleton className="h-4 w-[80px]" />
        </TableCell>
        <TableCell className="text-right">
            <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
            </div>
        </TableCell>
      </TableRow>
    ))
  );

  const renderRegistrationRow = (registration: RegistrationUI) => (
    <TableRow key={registration.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={registration.avatarUrl ?? undefined}
              alt={registration.name}
            />
            <AvatarFallback>{getInitials(registration.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{registration.name}</div>
            <div className="text-sm text-muted-foreground">
              {registration.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {format(new Date(registration.registrationDate), "PPp")}
      </TableCell>
      <TableCell>
        <Badge variant={
            registration.status === "approved" ? "default" :
            registration.status === "rejected" ? "destructive" :
            "secondary"
        }>
            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetails(registration)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {registration.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleApprove(registration.id)}
                disabled={isApproving}
                title="Approve"
                className="text-green-500 hover:text-green-600"
              >
                {isApproving ? <Skeleton className="h-4 w-4 rounded-full animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleReject(registration)}
                disabled={isRejecting} // Could disable if rejection dialog is open for THIS user
                title="Reject"
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );


  return (
    <div className="flex flex-col h-screen">
      {/* Header stays in the layout or page, removed from here */}
       <main className="flex-1 overflow-auto p-4 md:p-6">
         {/* Back Button and Event Title */}
         <div className="flex items-center gap-4 mb-4">
             <Link href="/organizer/events" passHref>
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
             </Link>
             <h1 className="text-xl md:text-2xl font-semibold">
                 {event ? `Registrations for ${event.name}` : 'Loading Event...'}
             </h1>
         </div>

        {/* Controls: Search, Filter, Sort, Export */}
        <Card className="mb-4">
            <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search by name or email..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                {/* Filter Dropdown */}
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterOption === 'all' ? 'Status' : filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                    value={filterOption}
                    onValueChange={(value) => setFilterOption(value as RegistrationStatus)}
                    >
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="approved">Approved</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="rejected">Rejected</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                        {/* Icon could change based on sort */}
                        Sort By
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                        <DropdownMenuRadioItem value="date_desc">Newest First</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="date_asc">Oldest First</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name_asc">Name (A-Z)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name_desc">Name (Z-A)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                 </DropdownMenu>

                 {/* Refresh Button */}
                <Button 
                  variant="outline" 
                  onClick={refreshRegistrations} 
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                 {/* Export Button (Placeholder) */}
                <Button variant="outline" disabled> {/* Add export functionality later */}
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
            </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
            <CardContent className="pt-0"> {/* Remove padding-top */}
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Registered At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading
                        ? renderSkeletons(5) // Show 5 skeletons while loading
                        : sortedAndFilteredRegistrations.length > 0
                            ? sortedAndFilteredRegistrations.map(renderRegistrationRow)
                            : (
                                <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">
                                    No registrations found matching your criteria.
                                </TableCell>
                                </TableRow>
                            )
                    }
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>

      {/* Details Dialog */}
      <Dialog open={!!selectedRegistration && !isRejectDialogOpen} onOpenChange={(open) => !open && handleCloseDetails()}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Registration Details</DialogTitle>
                <DialogDescription>
                    {selectedRegistration?.name} - {selectedRegistration?.email}
                </DialogDescription>
            </DialogHeader>
            {selectedRegistration && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                 <p><strong>Status:</strong> <Badge variant={
                        selectedRegistration.status === "approved" ? "default" :
                        selectedRegistration.status === "rejected" ? "destructive" :
                        "secondary"
                    }>
                        {selectedRegistration.status.charAt(0).toUpperCase() + selectedRegistration.status.slice(1)}
                    </Badge>
                </p>
                 <p><strong>Registered At:</strong> {format(new Date(selectedRegistration.registrationDate), "PPP p")}</p>

                 <h4 className="font-semibold mt-4 border-t pt-4">Application Answers</h4>
                 {Object.entries(selectedRegistration.answers).map(([questionId, answer]) => (
                    <div key={questionId} className="mb-3">
                       <Label className="font-medium">{selectedRegistration.questions[questionId]?.question_text || `Question ID: ${questionId}`}</Label>
                       <p className="text-sm text-muted-foreground whitespace-pre-wrap">{answer || '-'}</p>
                    </div>
                 ))}
                </div>
            )}
             <DialogFooter className="mt-4">
                {/* Add actions specific to the details view if needed, e.g., Edit */}
                {selectedRegistration?.status === 'pending' && (
                    <div className="flex gap-2">
                        <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleReject(selectedRegistration)} disabled={isApproving || isRejecting}>Reject</Button>
                        <Button variant="default" onClick={() => handleApprove(selectedRegistration.id)} disabled={isApproving || isRejecting}>
                            {isApproving ? 'Approving...' : 'Approve'}
                        </Button>
                    </div>
                )}
                {/* Always show close button */}
                <Button variant="outline" onClick={handleCloseDetails}>Close</Button>
             </DialogFooter>
          </DialogContent>
      </Dialog>

        {/* Rejection Confirmation Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={(open) => !open && handleCloseRejectDialog()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Rejection</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting {selectedRegistration?.name}'s registration. This reason might be shared with the applicant.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="rejectionReason" className="sr-only">Rejection Reason</Label>
                    <Textarea
                        id="rejectionReason"
                        placeholder="Enter rejection reason (optional but recommended)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCloseRejectDialog} disabled={isRejecting}>Cancel</Button>
                    <Button variant="destructive" onClick={handleRejectConfirm} disabled={isRejecting}>
                        {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
} 