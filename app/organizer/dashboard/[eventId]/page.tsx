"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/SiteHeader"
import createClient from "@/lib/supabase/client"
import { format } from "date-fns"
import { DBEvent } from "@/components/EventCard"
import { Check, Eye, RefreshCw, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EventDashboardPage() {
  const params = useParams<{ eventId: string }>()
  const eventId = params.eventId
  const router = useRouter()

  // State for event data
  const [eventData, setEventData] = useState<DBEvent & {
    currentParticipants?: number;
  } | null>(null)
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([])
  const [teamStats, setTeamStats] = useState([
    { status: "Registered", count: 0 },
    { status: "Completed", count: 0 },
    { status: "Dropped", count: 0 }
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [eventForm, setEventForm] = useState<any>(null)

  // State for registrations handling
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  // Fetch event data from Supabase
  useEffect(() => {
    async function fetchEventData() {
      setIsLoading(true)
      setError(null)
      
      try {
        const supabase = createClient()
        
        // Fetch event data
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single()
        
        if (eventError) throw eventError
        
        // Use a SQL RPC call to get detailed registration data with proper joins
        const { data: regData, error: regSqlError } = await supabase.rpc(
          'direct_query',
          {
            query_text: `
              SELECT 
                r.id as registration_id,
                r.event_id,
                r.participant_id,
                r.team_id,
                r.registration_type,
                r.status,
                r.created_at,
                r.payment_status,
                r.payment_screenshot,
                r.rejection_reason,
                p.name as participant_name,
                p.email as participant_email,
                p.avatar_url,
                t.name as team_name,
                COALESCE((
                  SELECT COUNT(*)
                  FROM team_members tm
                  WHERE tm.team_id = t.id
                ), 1) as member_count
              FROM 
                registrations r
              LEFT JOIN 
                participants p ON r.participant_id = p.id
              LEFT JOIN
                teams t ON r.team_id = t.id
              WHERE 
                r.event_id = '${eventId}'
              ORDER BY
                r.created_at DESC
              LIMIT 10
            `
          }
        )

        // If SQL RPC has an error or no results, fall back to regular queries
        if (regSqlError || !regData || regData.length === 0) {
          console.log("Falling back to separate queries for registrations")
          
          // Fetch registrations
          const { data: registrations, error: regError } = await supabase
            .from('registrations')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })
            .limit(10)
          
          if (regError) throw regError
          
          // Fetch participant data
          const participantIds = registrations?.map(reg => reg.participant_id) || []
          const teamIds = registrations?.filter(reg => reg.team_id).map(reg => reg.team_id) || []
          
          // Fetch all participants in a single query
          const { data: participants, error: partError } = await supabase
            .from('participants')
            .select('id, name, email, avatar_url')
            .in('id', participantIds)
          
          if (partError) throw partError
          
          // Fetch all teams in a single query
          const { data: teams, error: teamError } = await supabase
            .from('teams')
            .select('id, name')
            .in('id', teamIds)
          
          if (teamError) throw teamError

          // Fetch team members count
          const { data: teamMembers, error: teamMembersError } = await supabase
            .from('team_members')
            .select('team_id')
            .in('team_id', teamIds)

          if (teamMembersError) throw teamMembersError

          // Create a map of team member counts
          const teamMemberCounts = teamMembers?.reduce((counts: Record<string, number>, tm) => {
            counts[tm.team_id] = (counts[tm.team_id] || 0) + 1
            return counts
          }, {}) || {}
          
          // Create lookup maps
          const participantMap = participants?.reduce((map, p) => {
            map[p.id] = p
            return map
          }, {} as Record<string, any>) || {}
          
          const teamMap = teams?.reduce((map, t) => {
            map[t.id] = {
              ...t,
              member_count: teamMemberCounts[t.id] || 1
            }
            return map
          }, {} as Record<string, any>) || {}
          
          // Format registrations
          const formattedRegistrations = registrations?.map(reg => {
            const participant = participantMap[reg.participant_id] || {}
            const team = reg.team_id ? teamMap[reg.team_id] : null
            
            return {
              id: reg.id,
              userId: reg.participant_id,
              name: participant.name || 'Unnamed Participant',
              email: participant.email || 'No Email',
              avatarUrl: participant.avatar_url,
              teamName: team?.name || 'Individual Registration',
              teamId: reg.team_id,
              members: team?.member_count || 1,
              registeredOn: reg.created_at,
              status: reg.status,
              paymentStatus: reg.payment_status
            }
          }) || []
          
          // Calculate team stats
          const registeredCount = registrations?.filter(reg => reg.status === 'approved' || reg.status === 'pending').length || 0
          const completedCount = registrations?.filter(reg => reg.status === 'approved').length || 0
          const droppedCount = registrations?.filter(reg => reg.status === 'rejected').length || 0

          // Update state with fetched data
          setEventData({
            ...event,
            currentParticipants: regData.filter((row: any) => row.status === 'approved').length || 0,
            max_participants: event.max_participants || 0  // Make sure we have the max_participants
          })
          
          setEventForm({
            ...event,
            currentParticipants: regData.filter((row: any) => row.status === 'approved').length || 0,
            max_participants: event.max_participants || 0  // Make sure we have the max_participants
          })
          
          setTeamStats([
            { status: "Registered", count: registeredCount },
            { status: "Completed", count: completedCount },
            { status: "Dropped", count: droppedCount }
          ])
          
          setRecentRegistrations(formattedRegistrations)
        } else {
          // Use the SQL query results
          const formattedRegistrations = regData.map((row: any) => ({
            id: row.registration_id,
            userId: row.participant_id,
            name: row.participant_name || 'Unnamed Participant',
            email: row.participant_email || 'No Email',
            avatarUrl: row.avatar_url,
            teamName: row.team_name || 'Individual Registration',
            teamId: row.team_id,
            members: row.member_count || 1,
            registeredOn: row.created_at,
            status: row.status,
            paymentStatus: row.payment_status
          }))

          // Calculate team stats from the registration data
          const registeredCount = regData.filter((row: any) => row.status === 'approved' || row.status === 'pending').length
          const completedCount = regData.filter((row: any) => row.status === 'approved').length
          const droppedCount = regData.filter((row: any) => row.status === 'rejected').length

          // Update state with fetched data
          setEventData({
            ...event,
            currentParticipants: regData.filter((row: any) => row.status === 'approved').length || 0,
            max_participants: event.max_participants || 0  // Make sure we have the max_participants
          })
          
          setEventForm({
            ...event,
            currentParticipants: regData.filter((row: any) => row.status === 'approved').length || 0,
            max_participants: event.max_participants || 0  // Make sure we have the max_participants
          })
          
          setTeamStats([
            { status: "Registered", count: registeredCount },
            { status: "Completed", count: completedCount },
            { status: "Dropped", count: droppedCount }
          ])
          
          setRecentRegistrations(formattedRegistrations)
        }
        
      } catch (err: any) {
        console.error("Error fetching event data:", err)
        setError(err.message || "Failed to load event data")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const handleFormChange = (field: string, value: any) => {
    setEventForm((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = async () => {
    try {
      const supabase = createClient()
      
      // Extract fields to update
      const { 
        name, description, start_date, end_date, 
        location, max_participants, registration_fee, 
        prize_money, is_published
      } = eventForm
      
      // Update the event in Supabase
      const { error } = await supabase
        .from('events')
        .update({
          name,
          description,
          start_date,
          end_date,
          location,
          max_participants,
          registration_fee,
          prize_money,
          is_published
        })
        .eq('id', eventId)
      
      if (error) throw error

      // Update eventData to reflect changes
      setEventData(prev => prev ? {
        ...prev,
        ...eventForm
      } : null)
      
    alert("Event updated successfully!")
    } catch (err: any) {
      console.error("Error saving event changes:", err)
      // Revert form changes on error
      setEventForm(eventData)
      alert(`Failed to update event: ${err.message}`)
    }
  }

  // Add a function to handle publish status change specifically
  const handlePublishStatusChange = async (checked: boolean) => {
    handleFormChange("is_published", checked)
  }

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Function to refresh registrations data
  const refreshRegistrations = async () => {
    if (!eventId) return
    
    setIsRefreshing(true)
    try {
      const supabase = createClient()
      
      // First get the event data to ensure we have max_participants
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('max_participants')
        .eq('id', eventId)
        .single()
      
      if (eventError) throw eventError
      
      // Use a SQL RPC call to get detailed registration data with proper joins
      const { data: regData, error: regSqlError } = await supabase.rpc(
        'direct_query',
        {
          query_text: `
            SELECT 
              r.id as registration_id,
              r.event_id,
              r.participant_id,
              r.team_id,
              r.registration_type,
              r.status,
              r.created_at,
              r.payment_status,
              r.payment_screenshot,
              r.rejection_reason,
              p.name as participant_name,
              p.email as participant_email,
              p.avatar_url,
              t.name as team_name,
              COALESCE((
                SELECT COUNT(*)
                FROM team_members tm
                WHERE tm.team_id = t.id
              ), 1) as member_count
            FROM 
              registrations r
            LEFT JOIN 
              participants p ON r.participant_id = p.id
            LEFT JOIN
              teams t ON r.team_id = t.id
            WHERE 
              r.event_id = '${eventId}'
            ORDER BY
              r.created_at DESC
            LIMIT 10
          `
        }
      )
      
      if (regSqlError || !regData || regData.length === 0) {
        // Fallback to regular queries (same as in fetchEventData)
        const { data: registrations, error: regError } = await supabase
          .from('registrations')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (regError) throw regError
        
        const participantIds = registrations?.map(reg => reg.participant_id) || []
        const teamIds = registrations?.filter(reg => reg.team_id).map(reg => reg.team_id) || []
        
        const { data: participants, error: partError } = await supabase
          .from('participants')
          .select('id, name, email, avatar_url')
          .in('id', participantIds)
        
        if (partError) throw partError
        
        const { data: teams, error: teamError } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', teamIds)
        
        if (teamError) throw teamError

        // Fetch team members count
        const { data: teamMembers, error: teamMembersError } = await supabase
          .from('team_members')
          .select('team_id')
          .in('team_id', teamIds)

        if (teamMembersError) throw teamMembersError

        // Create a map of team member counts
        const teamMemberCounts = teamMembers?.reduce((counts: Record<string, number>, tm) => {
          counts[tm.team_id] = (counts[tm.team_id] || 0) + 1
          return counts
        }, {}) || {}
        
        const participantMap = participants?.reduce((map, p) => {
          map[p.id] = p
          return map
        }, {} as Record<string, any>) || {}
        
        const teamMap = teams?.reduce((map, t) => {
          map[t.id] = {
            ...t,
            member_count: teamMemberCounts[t.id] || 1
          }
          return map
        }, {} as Record<string, any>) || {}
        
        const formattedRegistrations = registrations?.map(reg => {
          const participant = participantMap[reg.participant_id] || {}
          const team = reg.team_id ? teamMap[reg.team_id] : null
          
          return {
            id: reg.id,
            userId: reg.participant_id,
            name: participant.name || 'Unnamed Participant',
            email: participant.email || 'No Email',
            avatarUrl: participant.avatar_url,
            teamName: team?.name || 'Individual Registration',
            teamId: reg.team_id,
            members: team?.member_count || 1,
            registeredOn: reg.created_at,
            status: reg.status,
            paymentStatus: reg.payment_status
          }
        }) || []
        
        // Update event data with current participants
        setEventData(prev => ({
          ...prev,
          currentParticipants: registrations?.filter(reg => reg.status === 'approved').length || 0,
          max_participants: event.max_participants || 0
        }))
        
        setEventForm(prev => ({
          ...prev,
          currentParticipants: registrations?.filter(reg => reg.status === 'approved').length || 0,
          max_participants: event.max_participants || 0
        }))
        
        setRecentRegistrations(formattedRegistrations)
      } else {
        // Use the SQL query results
        const formattedRegistrations = regData.map((row: any) => ({
          id: row.registration_id,
          userId: row.participant_id,
          name: row.participant_name || 'Unnamed Participant',
          email: row.participant_email || 'No Email',
          avatarUrl: row.avatar_url,
          teamName: row.team_name || 'Individual Registration',
          teamId: row.team_id,
          members: row.member_count || 1,
          registeredOn: row.created_at,
          status: row.status,
          paymentStatus: row.payment_status
        }))

        // Update event data with current participants
        setEventData(prev => ({
          ...prev,
          currentParticipants: regData.filter(row => row.status === 'approved').length || 0,
          max_participants: event.max_participants || 0
        }))
        
        setEventForm(prev => ({
          ...prev,
          currentParticipants: regData.filter(row => row.status === 'approved').length || 0,
          max_participants: event.max_participants || 0
        }))
        
        setRecentRegistrations(formattedRegistrations)
      }
    } catch (err: any) {
      console.error("Error refreshing registrations:", err)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle viewing registration details
  const handleViewDetails = (registration: any) => {
    setSelectedRegistration(registration)
  }

  // Handle registration approval
  const handleApprove = async (registrationId: string) => {
    if (!eventId) return
    
    setIsApproving(true)
    try {
      const supabase = createClient()
      
      // Fetch registration details to check for points used
      const { data: registrationData, error: fetchError } = await supabase
        .from('registrations')
        .select('participant_id, points_used, discount_amount, status')
        .eq('id', registrationId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // If already approved, don't process again
      if (registrationData.status === 'approved') {
        alert("This registration is already approved.");
        setIsApproving(false);
        return;
      }
      
      // Update registration status
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId)
      
      if (updateError) throw updateError
      
      // Process point transaction if points were used
      if (registrationData.points_used && registrationData.points_used > 0) {
        try {
          // Generate a transaction hash for blockchain
          const transactionHash = generateTransactionHash();
          
          // 1. Update the pending transaction to completed
          const { error: pendingUpdateError } = await supabase
            .from('blockchain_transactions')
            .update({
              transaction_type: 'spend',  // Change from 'pending_spend' to 'spend'
              transaction_hash: transactionHash,
              updated_at: new Date().toISOString()
            })
            .eq('registration_id', registrationId)
            .eq('transaction_type', 'pending_spend');
            
          if (pendingUpdateError) {
            console.error("Error updating pending transaction:", pendingUpdateError);
          }
          
          // 2. Also create a record in token_balances or update existing balance
          // First check if balance exists
          const { data: balanceData, error: balanceError } = await supabase
            .from('token_balances')
            .select('balance')
            .eq('participant_id', registrationData.participant_id)
            .single();
            
          if (balanceError && balanceError.code !== 'PGRST116') { // PGRST116 = not found
            console.error("Error checking token balance:", balanceError);
          }
          
          // If balance exists, update it; otherwise create it
          if (balanceData) {
            const newBalance = Math.max(0, balanceData.balance - registrationData.points_used);
            const { error: updateBalanceError } = await supabase
              .from('token_balances')
              .update({ balance: newBalance })
              .eq('participant_id', registrationData.participant_id);
              
            if (updateBalanceError) {
              console.error("Error updating token balance:", updateBalanceError);
            }
          } else {
            // This shouldn't normally happen as balance should be initialized elsewhere,
            // but handle it just in case
            const { error: insertBalanceError } = await supabase
              .from('token_balances')
              .insert({ 
                participant_id: registrationData.participant_id,
                balance: 0 // Start with 0 since we're spending points
              });
              
            if (insertBalanceError) {
              console.error("Error creating token balance:", insertBalanceError);
            }
          }
          
          console.log(`Processed point transaction: ${registrationData.points_used} points spent for discount of ${registrationData.discount_amount}`);
        } catch (pointsError) {
          console.error("Error processing points transaction:", pointsError);
          // Don't fail the approval if points processing fails
        }
      }
      
      // Update event participant count
      if (eventData) {
        const newCount = (eventData.currentParticipants || 0) + 1
        await supabase
          .from('events')
          .update({ current_participants: newCount })
          .eq('id', eventId)
      }
      
      // Update local state
      setRecentRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: 'approved' } 
            : reg
        )
      )
      
      alert("Registration approved successfully!")
      refreshRegistrations()
    } catch (err: any) {
      console.error("Error approving registration:", err)
      alert(`Failed to approve registration: ${err.message}`)
    } finally {
      setIsApproving(false)
      setSelectedRegistration(null)
    }
  }

  // Generate a transaction hash for blockchain
  function generateTransactionHash(): string {
    const prefix = 'txn_';
    const characters = 'abcdef0123456789';
    let hash = prefix;
    
    // Generate a 32-character hash
    for (let i = 0; i < 32; i++) {
      hash += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return hash;
  }

  // Handle rejection
  const handleReject = (registration: any) => {
    setSelectedRegistration(registration)
    setRejectionReason("")
    setIsRejectDialogOpen(true)
  }

  // Handle rejection confirmation
  const handleRejectConfirm = async () => {
    if (!selectedRegistration || !eventId) return
    
    setIsRejecting(true)
    try {
      const supabase = createClient()
      
      // Check if registration was previously approved
      const { data: registration } = await supabase
        .from('registrations')
        .select('status')
        .eq('id', selectedRegistration.id)
        .single()
      
      const wasApproved = registration?.status === 'approved'
      
      // Update registration status with rejection reason
      await supabase
        .from('registrations')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRegistration.id)
      
      // Decrement participant count if previously approved
      if (wasApproved && eventData) {
        const newCount = Math.max(0, (eventData.currentParticipants || 0) - 1)
        await supabase
          .from('events')
          .update({ current_participants: newCount })
          .eq('id', eventId)
      }
      
      // Update local state
      setRecentRegistrations(prev => 
        prev.map(reg => 
          reg.id === selectedRegistration.id 
            ? { ...reg, status: 'rejected' } 
            : reg
        )
      )
      
      alert("Registration rejected successfully!")
      setIsRejectDialogOpen(false)
      refreshRegistrations()
    } catch (err: any) {
      console.error("Error rejecting registration:", err)
      alert(`Failed to reject registration: ${err.message}`)
    } finally {
      setIsRejecting(false)
      setSelectedRegistration(null)
    }
  }

  const handleCloseDetails = () => {
    setSelectedRegistration(null)
  }

  const handleCloseRejectDialog = () => {
    setIsRejectDialogOpen(false)
    setSelectedRegistration(null)
  }

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case "confirmed":
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const viewAllRegistrations = () => {
    router.push(`/organizer/registrations/${eventId}`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center h-[50vh]">
            <p>Loading event data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !eventData) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center h-[50vh]">
            <p className="text-red-500">{error || "Event not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Event Dashboard: {eventData.name}</h1>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Participants</CardTitle>
            <CardDescription>Current registrations</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="text-3xl font-bold">{eventData.currentParticipants} / {eventData.max_participants}</div>
            <div className="text-sm text-muted-foreground mt-2">
                {eventData.max_participants ? 
                  `${Math.round((eventData.currentParticipants / eventData.max_participants) * 100)}% capacity` :
                  'No participant limit set'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Status</CardTitle>
            <CardDescription>Event visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch 
                  checked={eventForm?.is_published}
                  onCheckedChange={handlePublishStatusChange}
              />
              <Label>
                  {eventForm?.is_published ? "Published" : "Draft"}
              </Label>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
                {eventForm?.is_published 
                ? "Event is visible to participants" 
                : "Event is hidden from participants"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Teams</CardTitle>
            <CardDescription>Team statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {teamStats.map(stat => (
                <div key={stat.status} className="text-center">
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-xs text-muted-foreground">{stat.status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input 
                    id="event-name" 
                      value={eventForm?.name || ""}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input 
                    id="start-date" 
                    type="date"
                      value={eventForm?.start_date ? new Date(eventForm.start_date).toISOString().split('T')[0] : ""}
                      onChange={(e) => handleFormChange("start_date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input 
                    id="end-date" 
                    type="date"
                      value={eventForm?.end_date ? new Date(eventForm.end_date).toISOString().split('T')[0] : ""}
                      onChange={(e) => handleFormChange("end_date", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                      value={eventForm?.location || ""}
                    onChange={(e) => handleFormChange("location", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-participants">Maximum Participants</Label>
                  <Input 
                    id="max-participants" 
                    type="number"
                      value={eventForm?.max_team_size || 0}
                      onChange={(e) => handleFormChange("max_team_size", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration-fee">Registration Fee</Label>
                  <Input 
                    id="registration-fee" 
                    type="number"
                      value={eventForm?.registration_fee || 0}
                      onChange={(e) => handleFormChange("registration_fee", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize-money">Prize Money</Label>
                  <Input 
                    id="prize-money" 
                      value={eventForm?.prize_money || ""}
                      onChange={(e) => handleFormChange("prize_money", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  rows={6}
                    value={eventForm?.description || ""}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
              <CardTitle>Recent Registrations</CardTitle>
                  <CardDescription>Manage participant registrations</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshRegistrations}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
            </CardHeader>
            <CardContent>
                {recentRegistrations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead>Team</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRegistrations.map(registration => (
                    <TableRow key={registration.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={registration.avatarUrl ?? undefined}
                                  alt={registration.name}
                                />
                                <AvatarFallback>{getInitials(registration.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{registration.name}</div>
                                <div className="text-xs text-muted-foreground">{registration.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{registration.teamName}</TableCell>
                      <TableCell>{registration.members}</TableCell>
                          <TableCell>{format(new Date(registration.registeredOn), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
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
                                    disabled={isRejecting} 
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
                  ))}
                </TableBody>
              </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No registrations yet
                  </div>
                )}
              <div className="mt-4 text-center">
                  <Button variant="outline" onClick={viewAllRegistrations}>View All Participants</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Registration Details Dialog */}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={
                    selectedRegistration.status === "approved" ? "default" :
                    selectedRegistration.status === "rejected" ? "destructive" :
                    "secondary"
                  }>
                    {selectedRegistration.status.charAt(0).toUpperCase() + selectedRegistration.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team</p>
                  <p>{selectedRegistration.teamName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered At</p>
                  <p>{format(new Date(selectedRegistration.registeredOn), "PPP p")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p>{selectedRegistration.members}</p>
                </div>
                {selectedRegistration.teamId && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Team ID</p>
                    <p>{selectedRegistration.teamId}</p>
                  </div>
                )}
                {selectedRegistration.status === "rejected" && selectedRegistration.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Rejection Reason</p>
                    <p className="bg-red-50 p-2 rounded border border-red-200">{selectedRegistration.rejectionReason}</p>
                  </div>
                )}
                {selectedRegistration.paymentStatus === "pending" && selectedRegistration.paymentScreenshot && (
                  <div className="col-span-2 mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Payment Screenshot</p>
                    <div className="w-full border rounded-lg overflow-hidden">
                      <img 
                        src={selectedRegistration.paymentScreenshot} 
                        alt="Payment Screenshot" 
                        className="w-full object-contain max-h-[300px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            {selectedRegistration?.status === 'pending' && (
              <div className="flex gap-2">
                <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleReject(selectedRegistration)} disabled={isApproving || isRejecting}>Reject</Button>
                <Button variant="default" onClick={() => handleApprove(selectedRegistration.id)} disabled={isApproving || isRejecting}>
                  {isApproving ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            )}
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
              Are you sure you want to reject {selectedRegistration?.name}'s registration?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="rejectionReason" className="text-sm">Rejection Reason (Optional)</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter reason for rejection (optional)"
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