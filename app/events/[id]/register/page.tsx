"use client"

import { useState, type FormEvent, type ChangeEvent, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Check, CreditCard, Info, MapPin, Upload, Users, AlertTriangle, Lock, CheckCircle } from "lucide-react"
import React from "react"
import QRCode from 'qrcode'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/SiteHeader"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { registerForEvent, type RegistrationFormData } from "./actions"
import createClient from "@/lib/supabase/client"
import { PointDiscountSelector } from "./PointDiscountSelector"

// Define the structure for the event data we expect
interface EventData {
  id: string;
  name: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  location?: string | null;
  registration_fee?: number | null;
  min_team_size?: number | null;
  max_team_size?: number | null;
  registration_end_date?: string | null;
  banner_image?: string | null;
  upi_id?: string | null;
  // qr_code_url field removed from the database
}

export default function EventRegistrationPage({ 
  params // Accept the whole params object
}: { 
  params: Promise<{ id: string }> // Type it as a Promise
}) {
  // Use React.use() to unwrap the params promise
  const { id: eventId } = use(params); // Unwrap and get the id
  
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null)
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedQRCode, setGeneratedQRCode] = useState<string | null>(null)
  const [userData, setUserData] = useState<{fullName: string, email: string, id: string} | null>(null)
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<{status: string} | null>(null)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [pointsToUse, setPointsToUse] = useState<number>(0)
  const [discountedFee, setDiscountedFee] = useState<number | null>(null)
  
  // Updated formData state to reflect simplified fields
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    fullName: "",
    email: "",
    phone: "",
    skills: "", // Still collect for participant profile
    teamStatus: "solo", // Default to solo
    teamName: "",
    teamMembers: "",
    lookingFor: "",
    transactionId: "",
    pointsUsed: 0,
    discountAmount: 0,
  })

  // Determine if the event allows teams
  const eventAllowsTeams = event && (event.max_team_size ?? 1) > 1;
  // Determine if event requires payment
  const isFreeEvent = !event?.registration_fee || Number(event.registration_fee) <= 0;

  // Calculate total steps dynamically
  const calculateTotalSteps = () => {
    let steps = 1; // Personal Info
    if (eventAllowsTeams) steps++; // Team Preference
    if (!isFreeEvent) steps += 2; // Payment + Verification
    steps++; // Confirmation
    return steps;
  };

  const totalSteps = event ? calculateTotalSteps() : 2; // Initial estimate before event loads

  // Function to generate QR code from UPI ID and amount
  const generateQRCode = async (upiId: string, amount: string) => {
    try {
      // Create UPI payment URL
      const upiUrl = `upi://pay?pa=${upiId}&am=${amount}&cu=INR`;
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  // Add handler for discount changes
  const handleDiscountChange = (discount: number, points: number) => {
    setDiscountAmount(discount);
    setPointsToUse(points);
    
    // Update discounted fee and regenerate QR code if event exists
    if (event?.registration_fee) {
      const newDiscountedFee = Math.max(0, event.registration_fee - discount);
      setDiscountedFee(newDiscountedFee);
      
      // Regenerate QR code with discounted amount if UPI is available
      if (event.upi_id && newDiscountedFee > 0) {
        generateQRCode(event.upi_id, newDiscountedFee.toString())
          .then(qrCode => setGeneratedQRCode(qrCode));
      }
    }
  };

  // Fetch event data and user profile data
  useEffect(() => {
    const fetchEventAndUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        
        // Authentication check and user data fetch
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError || !authData.session) {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          router.push('/login?message=Please log in to register for the event');
          return;
        }

        // Store the actual user ID for blockchain API calls
        const actualUserId = authData.session.user.id;

        // Check if user is already registered for this event
        const { data: registrationData, error: registrationError } = await supabase
          .from("registrations")
          .select("status")
          .eq("event_id", eventId)
          .eq("participant_id", authData.session.user.id)
          .single();
        
        if (registrationData) {
          console.log("User already registered with status:", registrationData.status);
          setIsAlreadyRegistered(registrationData);
        }

        console.log("Auth user:", authData.session.user);
        
        // Get user metadata for debugging
        const userMeta = authData.session.user.user_metadata;
        console.log("User metadata:", userMeta);
        
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("participants")
          .select("full_name, email")
          .eq("id", authData.session.user.id)
          .single();
        
        console.log("Profile data:", profileData);
        
        // Try multiple sources for the name with better fallbacks
        let userName = '';
        
        // Check profile data first
        if (profileData?.full_name) {
          userName = profileData.full_name;
        } 
        // Then check auth metadata with multiple possible keys
        else if (userMeta) {
          userName = userMeta.full_name || userMeta.name || userMeta.user_name || 
                    userMeta.preferred_username || userMeta.username || '';
        }
        
        // Get email from profile or auth
        const userEmail = profileData?.email || authData.session.user.email || '';
        
        console.log("Setting user data:", { fullName: userName, email: userEmail });
        
        // Set user data for display and tracking
        setUserData({
          fullName: userName,
          email: userEmail,
          id: actualUserId // Add user ID to userData
        });
        
        // Update form data with user information
        setFormData(prev => ({ 
          ...prev, 
          fullName: userName,
          email: userEmail 
        }));

        // Fetch event data
        const { data: eventData, error: dbError } = await supabase
          .from("events")
          .select("id, name, description, start_date, end_date, location, registration_fee, min_team_size, max_team_size, registration_end_date, banner_image, upi_id")
          .eq("id", eventId)
          .single();
        
        if (dbError) throw dbError;
        if (!eventData) throw new Error("Event not found");
        
        setEvent(eventData as EventData);
        
        // Generate QR code if this is a paid event with UPI ID
        if (eventData.registration_fee && Number(eventData.registration_fee) > 0 && eventData.upi_id) {
          // Initialize with full price
          setDiscountedFee(Number(eventData.registration_fee));
          const qrCode = await generateQRCode(eventData.upi_id, eventData.registration_fee.toString());
          setGeneratedQRCode(qrCode);
        }
        
        // Auto-complete payment for free events
        if (!eventData.registration_fee || Number(eventData.registration_fee) <= 0) {
          setPaymentComplete(true);
        }

        // Set initial team status based on event config
        if (!((eventData.max_team_size ?? 1) > 1)) {
          setFormData(prev => ({ ...prev, teamStatus: 'solo' }));
        } else {
          // If teams are allowed, default might be looking or solo based on preference
          setFormData(prev => ({ ...prev, teamStatus: 'looking' })); 
        }

      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndUserData();
  }, [eventId, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Navigation Logic --- 
  const getCurrentStepIndex = () => {
    if (currentStep === 1) return 1; // Personal Info
    let index = 1;
    if (eventAllowsTeams) {
      if (currentStep === 2) return 2; // Team Info
      index++;
    }
    if (!isFreeEvent) {
      if (currentStep === index + 1) return index + 1; // Payment
      if (currentStep === index + 2) return index + 2; // Verification
      index += 2;
    }
    if (currentStep === index + 1) return index + 1; // Confirmation
    return 1; // Default
  };

  const handleNextStep = () => {
    // Basic validation before moving
    const currentStepIndex = getCurrentStepIndex();
    if (currentStepIndex === 1) { // Personal Info
      if (!formData.fullName || !formData.email || !formData.phone || !formData.skills) {
        toast({ title: "Missing Information", description: "Please fill in all personal information fields.", variant: "destructive" });
        return;
      }
    }
    if (currentStepIndex === 2 && eventAllowsTeams) { // Team Info
      if (formData.teamStatus === "have-team" && !formData.teamName) {
        toast({ title: "Missing Team Name", description: "Please enter your team name.", variant: "destructive" });
        return;
      }
      if (formData.teamStatus === "looking" && !formData.lookingFor) {
         toast({ title: "Describe Teammates", description: "Please describe the teammates you are looking for.", variant: "destructive" });
         return;
       }
    }

    // Determine the next step index
    let nextStepIndex = currentStepIndex + 1;
    if (currentStepIndex === 1 && !eventAllowsTeams) { // Skip team step
      nextStepIndex++;
    }
    if (currentStepIndex === (eventAllowsTeams ? 2 : 1) && isFreeEvent) { // Skip payment steps
       nextStepIndex = totalSteps; // Go directly to confirmation
    }
    // Add logic for skipping payment verification if payment step is completed automatically?
    // For now, handlePaymentComplete moves to next step manually.

    setCurrentStep(nextStepIndex);
    window.scrollTo(0, 0);
  };

  const handlePreviousStep = () => {
    const currentStepIndex = getCurrentStepIndex();
    let previousStepIndex = currentStepIndex - 1;

    if (currentStepIndex === totalSteps && isFreeEvent) { // Coming back from confirmation (free event)
        previousStepIndex = eventAllowsTeams ? 2 : 1; // Go back to Team or Personal Info
    }
     if (currentStepIndex === (eventAllowsTeams ? 3 : 2) && !eventAllowsTeams) { // Skip team step when going back from payment/confirmation
       previousStepIndex--;
     }

    setCurrentStep(previousStepIndex > 0 ? previousStepIndex : 1);
    window.scrollTo(0, 0);
  };
  
  const handlePaymentComplete = () => {
    setPaymentComplete(true);
    // Move to the next step (Verification)
    const currentStepIndex = getCurrentStepIndex();
    setCurrentStep(currentStepIndex + 1);
    window.scrollTo(0, 0);
  };

  // --- Submission Logic --- 
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isFreeEvent && !paymentScreenshot) {
      toast({ title: "Payment Verification Required", description: "Please upload a screenshot of your payment.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Include points and discount in form data
      const finalFormData: RegistrationFormData = {
        ...formData as RegistrationFormData,
        paymentScreenshot,
        pointsUsed: pointsToUse,
        discountAmount: discountAmount
      };
      
      const result = await registerForEvent(eventId, finalFormData);
      
      if (!result.success) {
        throw new Error(result.error || "Registration failed");
      }
      
      toast({ title: "Registration Submitted Successfully", description: "Your registration is pending approval. You'll be notified via email.", });
      router.push("/participant/dashboard");

    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong during registration.");
      toast({ title: "Registration Failed", description: err.message || "Please check your details and try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size check (e.g., 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Payment screenshot must be under 10MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPaymentScreenshot(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Show loading state with improved UI
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="animate-spin h-12 w-12 border-t-4 border-primary rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-medium mb-2">Loading Registration Form</h3>
            <p className="text-muted-foreground">Retrieving event details and preparing your form...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show already registered state
  if (isAlreadyRegistered) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container max-w-4xl mx-auto py-12 px-4">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 group transition-all hover:bg-muted/80">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Event
            </Button>
            
            <Card className="overflow-hidden border-muted/60 shadow-md">
              <div className="bg-primary/10 p-6 flex items-center border-b">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500 mr-4 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-semibold mb-1">
                    You're Already Registered
                  </h2>
                  <p className="text-muted-foreground">
                    Registration Status: <span className="font-medium capitalize">{isAlreadyRegistered.status}</span>
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <p className="mb-6">
                  You've already registered for {event?.name}. You can view your registration details and status in your dashboard.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild>
                    <Link href="/participant/dashboard">
                      Go to My Dashboard
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <Link href={`/events/${eventId}`}>
                      View Event Details
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if event fetch failed
  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container py-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Event</AlertTitle>
              <AlertDescription>
                {error || "This event could not be found or loaded. Please check the link or try again later."}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/">Return to Events</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Format date utility
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "TBA";
    try {
       return format(new Date(dateString), "MMMM d, yyyy");
    } catch {
      return "Invalid Date";
    }
  };
  
  // --- Render Steps --- 
  const renderStepIndicator = (stepIndex: number, label: string) => {
    const isActive = currentStep === stepIndex;
    const isCompleted = currentStep > stepIndex;
    return (
      <div key={label} className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isActive || isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {isCompleted ? <Check className="h-4 w-4" /> : stepIndex}
        </div>
        <span className={isActive || isCompleted ? "font-medium" : "text-muted-foreground"}>{label}</span>
      </div>
    );
  };

  const steps = ["Personal Info"];
  if (eventAllowsTeams) steps.push("Team Preference");
  if (!isFreeEvent) {
    steps.push("Payment");
    steps.push("Verification");
  }
  steps.push("Confirmation");

  // Map step labels to their sequence number
  const stepMap: { [key: string]: number } = {};
  steps.forEach((label, index) => stepMap[label] = index + 1);

  return (
    <>
          <SiteHeader />
      <div className="container mx-auto max-w-5xl py-8 px-4 mt-4 mb-16">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 group transition-all hover:bg-muted/80">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Event
                </Button>
        
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{event?.name ? `Register for ${event.name}` : 'Event Registration'}</h1>
            <p className="text-muted-foreground">Complete the registration process to secure your spot.</p>
            </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8 bg-muted/30 p-4 rounded-lg">
               {steps.map((label, index) => (
                 <React.Fragment key={label}>
                   {renderStepIndicator(index + 1, label)}
                   {index < steps.length - 1 && <Separator orientation="horizontal" className="w-8 mx-2 hidden sm:block" />}
                 </React.Fragment>
               ))}
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
              <Card className="shadow-sm border-muted/60">
                  <form onSubmit={handleSubmit}>
                    {currentStep === stepMap["Personal Info"] && (
                      <>
                      <CardHeader className="pb-4">
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>
                          We've pre-filled your profile information. Please complete the rest.
                          </CardDescription>
                        </CardHeader>
                      <CardContent className="space-y-5">
                          <div className="space-y-2">
                          <Label htmlFor="fullName" className="flex items-center">
                            Full Name <Lock className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                          </Label>
                          <div className="relative">
                            <Input 
                              id="fullName" 
                              value={formData.fullName || ''} 
                              className="bg-muted/40 text-muted-foreground pr-10" 
                              readOnly 
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground">Auto-filled from your account</p>
                        </div>
                        
                          <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center">
                            Email Address <Lock className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                          </Label>
                          <div className="relative">
                            <Input 
                              id="email" 
                              type="email" 
                              value={formData.email || ''} 
                              className="bg-muted/40 text-muted-foreground pr-10" 
                              readOnly 
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground">Auto-filled from your account</p>
                        </div>
                        
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="+1 (555) 123-4567" 
                            required 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            autoComplete="tel"
                            className="focus:border-primary"
                          />
                          </div>
                        
                          <div className="space-y-2">
                            <Label htmlFor="skills">Relevant Skills</Label>
                            <Textarea
                              id="skills"
                              placeholder="List your relevant skills, separated by commas (e.g., React, Node.js, Project Management)"
                            className="min-h-24 resize-y focus:border-primary"
                              required
                              value={formData.skills}
                              onChange={handleInputChange}
                            />
                             <p className="text-xs text-muted-foreground">This helps organizers and potential teammates understand your expertise.</p>
                          </div>
                        </CardContent>
                      <CardFooter className="flex justify-end pt-4 border-t">
                        <Button 
                          type="button" 
                          onClick={handleNextStep}
                          className="transition-all"
                        >
                             Next: {eventAllowsTeams ? "Team Preference" : (isFreeEvent ? "Confirmation" : "Payment")}
                          </Button>
                        </CardFooter>
                      </>
                    )}

                    {eventAllowsTeams && currentStep === stepMap["Team Preference"] && (
                      <>
                        <CardHeader>
                          <CardTitle>Team Preference</CardTitle>
                          <CardDescription>Let us know if you're joining solo, with a team, or looking for one.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup 
                             value={formData.teamStatus || "looking"} 
                              onValueChange={(value) => handleRadioChange("teamStatus", value)}
                             className="space-y-2"
                            >
                             <Label>How are you participating?</Label>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="have-team" id="have-team" />
                              <Label htmlFor="have-team" className="font-normal">I already have a team</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="looking" id="looking" />
                              <Label htmlFor="looking" className="font-normal">I'm looking to join a team</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="solo" id="solo" />
                              <Label htmlFor="solo" className="font-normal">I plan to participate solo</Label>
                              </div>
                            </RadioGroup>

                          {formData.teamStatus === "have-team" && (
                            <>
                              <div className="space-y-2 pt-4">
                                <Label htmlFor="teamName">Team Name</Label>
                            <Input 
                              id="teamName" 
                                  placeholder="Enter your team's name" 
                                  value={formData.teamName || ""}
                              onChange={handleInputChange}
                                  required={formData.teamStatus === "have-team"}
                            />
                          </div>
                          <div className="space-y-2">
                                <Label htmlFor="teamMembers">Team Members (Optional)</Label>
                            <Textarea
                              id="teamMembers"
                                  placeholder="List emails of members already in your team (one per line or comma separated). They still need to register."
                              className="min-h-24"
                                  value={formData.teamMembers || ""}
                              onChange={handleInputChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                   Team Size: {event.min_team_size || 1} - {event.max_team_size} members.
                            </p>
                          </div>
                            </>
                          )}

                          {formData.teamStatus === "looking" && (
                            <div className="space-y-2 pt-4">
                              <Label htmlFor="lookingFor">What are you looking for in teammates?</Label>
                            <Textarea
                              id="lookingFor"
                                placeholder="Describe skills, roles, or ideas you're interested in (e.g., Backend Developer, UI/UX Designer)"
                              className="min-h-24"
                                value={formData.lookingFor || ""}
                              onChange={handleInputChange}
                                required={formData.teamStatus === "looking"}
                            />
                          </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button type="button" variant="outline" onClick={handlePreviousStep}>Back</Button>
                          <Button type="button" onClick={handleNextStep}>
                             Next: {isFreeEvent ? "Confirmation" : "Payment"}
                          </Button>
                        </CardFooter>
                      </>
                    )}

                    {!isFreeEvent && currentStep === stepMap["Payment"] && (
                      <>
                        <CardHeader>
                          <CardTitle>Registration Payment</CardTitle>
                          <CardDescription>Please complete the payment to proceed.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <AlertTitle>Registration Fee: ₹{event?.registration_fee}</AlertTitle>
                            <AlertDescription>
                              Follow the instructions below to pay the registration fee.
                            </AlertDescription>
                          </Alert>

                          {event?.registration_fee && event.registration_fee > 0 && userData && (
                            <div className="mb-6">
                              <PointDiscountSelector 
                                userId={userData?.id || ''}
                                eventId={eventId}
                                registrationFee={event.registration_fee}
                                onDiscountChange={handleDiscountChange}
                              />
                              
                              {discountAmount > 0 && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900 dark:border-green-800">
                                  <p className="font-medium flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                    Discount Applied: ₹{discountAmount.toFixed(2)}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    New total: ₹{discountedFee?.toFixed(2) || '0.00'} 
                                    ({pointsToUse} points will be deducted upon approval)
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="rounded-lg border p-6 text-center">
                            <h3 className="text-lg font-medium mb-4">Scan QR Code or use UPI ID</h3>
                            {generatedQRCode && (
                              <div className="flex justify-center mb-4">
                                <img
                                  src={generatedQRCode}
                                  alt="Payment QR Code"
                                  className="h-64 w-64 object-contain border rounded-md"
                                />
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground mb-4">
                              {event.upi_id && <p>UPI ID: {event.upi_id}</p>}
                              <p>Amount: ₹{discountedFee?.toFixed(2) || event?.registration_fee}</p>
                            </div>
                            <Button type="button" variant="secondary" className="w-full" onClick={handlePaymentComplete}>
                              I Have Completed the Payment
                            </Button>
                          </div>
                        </CardContent>
                         <CardFooter className="flex justify-start">
                           <Button type="button" variant="outline" onClick={handlePreviousStep}>Back</Button>
                         </CardFooter>
                      </>
                    )}

                    {!isFreeEvent && currentStep === stepMap["Verification"] && (
                      <>
                        <CardHeader>
                          <CardTitle>Payment Verification</CardTitle>
                          <CardDescription>Upload a screenshot of your completed payment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="payment-screenshot-upload">Payment Screenshot (Required)</Label>
                            <div className="flex items-center justify-center w-full">
                              <label
                                htmlFor="payment-screenshot-upload"
                                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                {paymentScreenshot ? (
                                  <img src={paymentScreenshot} alt="Payment Screenshot Preview" className="h-full w-full object-contain p-2" />
                                ) : (
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 10MB)</p>
                                  </div>
                                )}
                              </label>
                              <Input id="payment-screenshot-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} required />
                            </div>
                            <p className="text-xs text-muted-foreground">This helps the organizers confirm your payment.</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                            <Input 
                              id="transactionId" 
                              placeholder="Enter payment reference or transaction ID" 
                              value={formData.transactionId || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Approval Required</AlertTitle>
                            <AlertDescription>
                              Your registration status will remain pending until payment is verified by the organizers.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button type="button" variant="outline" onClick={handlePreviousStep}>Back</Button>
                          <Button type="button" onClick={handleNextStep} disabled={!paymentScreenshot}>
                             Next: Confirmation
                          </Button>
                        </CardFooter>
                      </>
                    )}

                    {currentStep === stepMap["Confirmation"] && (
                      <>
                        <CardHeader>
                          <CardTitle>Confirm Registration</CardTitle>
                          <CardDescription>Review your information before submitting.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {error && (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Registration Error</AlertTitle>
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          )}
                          
                          <Alert variant="default">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Registration Summary</AlertTitle>
                            <AlertDescription className="space-y-1">
                              <p><strong>Name:</strong> {formData.fullName}</p>
                              <p><strong>Email:</strong> {formData.email}</p>
                              {eventAllowsTeams && (
                                <p><strong>Participation:</strong> {
                                  formData.teamStatus === "have-team" ? `With Team (${formData.teamName || '-'})` :
                                  formData.teamStatus === "looking" ? "Looking for a Team" :
                                  "Participating Solo"
                                }</p>
                              )}
                              <p><strong>Fee:</strong> {isFreeEvent ? "Free Event" : `₹${event?.registration_fee} (Pending Verification)`}</p>
                            </AlertDescription>
                          </Alert>

                           <Alert className={isFreeEvent ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200" : "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"}>
                            <Check className="h-4 w-4" />
                            <AlertTitle>{isFreeEvent ? "Ready to Register!" : "Payment Uploaded"}</AlertTitle>
                            <AlertDescription>
                              {isFreeEvent 
                                ? "Click Complete Registration to submit your details."
                                : "Your payment screenshot is uploaded. Click Complete Registration to submit everything for review."
                              }
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button type="button" variant="outline" onClick={handlePreviousStep}>Back</Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Complete Registration"}
                          </Button>
                        </CardFooter>
                      </>
                    )}
                  </form>
                </Card>
              </div>

            <div className="md:col-span-1 space-y-6">
              <Card className="shadow-sm border-muted/60 sticky top-24">
                <CardHeader className="pb-3">
                    <CardTitle>Event Details</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-5">
                  {event?.banner_image && (
                    <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                      <img src={event.banner_image} alt={event.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    )}
                  <h3 className="text-xl font-semibold pt-2">{event?.name}</h3>
                  {event?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                  )}
                  
                    <Separator />
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <Calendar className="mr-3 h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Date</p>
                        <p className="text-muted-foreground">{formatDate(event?.start_date)} - {formatDate(event?.end_date)}</p>
                      </div>
                      </div>
                    
                    <div className="flex items-start">
                      <MapPin className="mr-3 h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Location</p>
                        <p className="text-muted-foreground">{event?.location || "Online"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CreditCard className="mr-3 h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Registration Fee</p>
                        <p className="text-muted-foreground">{isFreeEvent ? "Free" : `₹${event?.registration_fee}`}</p>
                      </div>
                    </div>
                    
                      {eventAllowsTeams && (
                      <div className="flex items-start">
                        <Users className="mr-3 h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Team Size</p>
                          <p className="text-muted-foreground">{event?.min_team_size || 1} - {event?.max_team_size || 4} members</p>
                        </div>
                      </div>
                      )}
                    </div>
                  
                  {event?.registration_end_date && (
                    <>
                    <Separator />
                      <div className="rounded-lg bg-muted/50 p-4 border border-muted">
                        <div className="flex items-start">
                          <Calendar className="mr-3 h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">Registration Deadline</p>
                            <p className="text-muted-foreground">{formatDate(event.registration_end_date)}</p>
                      </div>
                    </div>
                      </div>
                    </>
                  )}
                  </CardContent>
                </Card>

              <Card className="shadow-sm border-muted/60">
                <CardHeader className="pb-3">
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Questions about registration or the event? Contact the organizers.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                    <Link href="/contact">Contact Support</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}


// Helper React component needed because map cannot be used directly in Server Components for Progress Indicator

