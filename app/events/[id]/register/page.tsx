"use client"

import { useState, type FormEvent, type ChangeEvent, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Calendar, Check, CheckCircle, Clipboard, CreditCard, FileText, Info, Lock, MapPin, MessageSquare, Send, Upload, User, Users, AlertTriangle, Mail } from "lucide-react"
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

// Function to sanitize text and remove inappropriate content
const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return "Information not available";
  
  return text
    .replace(/love this shit/gi, "love this event")
    .replace(/dont trust bitches/gi, "bring your friends")
    .replace(/mere dil mein/gi, "Convention Center")
    .replace(/shit|fuck|bitch|ass/gi, "stuff")
    .replace(/\b(offensive|explicit)\b/gi, "friendly");
};

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
      
      toast({ title: "Registration Submitted Successfully", description: "Your registration is pending approval. You'll be notified via email." });
      router.push("/");

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
      <div className="flex min-h-screen flex-col items-center justify-center">
        <SiteHeader />
        <p className="text-lg">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <SiteHeader />
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Event</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <SiteHeader />
        <p className="text-lg">Event not found.</p>
        <Button asChild className="mt-4">
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>
    );
  }
  
  if (isAlreadyRegistered) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <SiteHeader />
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Already Registered!</CardTitle>
            <CardDescription>
              You have already registered for {event.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your registration status is: <span className="font-semibold">{isAlreadyRegistered.status}</span></p>
            {/* Optionally show more details based on status */}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href={`/events/${eventId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Event Page
              </Link>
            </Button>
          </CardFooter>
        </Card>
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
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 pt-20">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Register for {sanitizeText(event?.name)}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Complete the registration process to secure your spot.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
            {renderStepIndicator(1, "Personal Info")}
            {eventAllowsTeams && renderStepIndicator(2, "Team Preference")}
            {!isFreeEvent && renderStepIndicator(eventAllowsTeams ? 3 : 2, "Payment")}
            {!isFreeEvent && renderStepIndicator(eventAllowsTeams ? 4 : 3, "Verify Payment")}
            {renderStepIndicator(totalSteps, "Confirmation")}
          </ol>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>We&apos;ve pre-filled your profile information. Please complete the rest.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center">
                        Full Name <Lock className="ml-1 h-3 w-3 text-muted-foreground" />
                      </Label>
                      <Input 
                        id="fullName" 
                        name="fullName"
                        value={formData.fullName}
                        readOnly 
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">Auto-filled from your account</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center">
                        Email Address <Lock className="ml-1 h-3 w-3 text-muted-foreground" />
                      </Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        value={formData.email}
                        readOnly 
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">Auto-filled from your account</p>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="skills">Relevant Skills</Label>
                      <Textarea 
                        id="skills"
                        name="skills"
                        placeholder="List your relevant skills, separated by commas (e.g., React, Node.js, Project Management)" 
                        value={formData.skills || ""}
                        onChange={handleInputChange} 
                      />
                      <p className="text-xs text-muted-foreground">
                        This helps organizers and potential teammates understand your expertise.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button type="button" onClick={handleNextStep}>
                      {eventAllowsTeams ? "Next: Team Preference" : isFreeEvent ? "Confirm Registration" : "Next: Payment"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Step 2: Team Preference (Conditional) */}
              {currentStep === getCurrentStepIndex() && eventAllowsTeams && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Team Preference
                    </CardTitle>
                    <CardDescription>How would you like to participate?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      name="teamStatus" 
                      value={formData.teamStatus}
                      onValueChange={(value) => handleRadioChange("teamStatus", value)}
                      className="space-y-4"
                    >
                      <Label htmlFor="solo" className="flex items-center space-x-2 cursor-pointer rounded-md border p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="solo" id="solo" />
                        <span>Participate Solo</span>
                      </Label>
                      <Label htmlFor="existing" className="flex items-center space-x-2 cursor-pointer rounded-md border p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="existing" id="existing" />
                        <span>Join an Existing Team</span>
                      </Label>
                      <Label htmlFor="new" className="flex items-center space-x-2 cursor-pointer rounded-md border p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="new" id="new" />
                        <span>Create a New Team</span>
                      </Label>
                      <Label htmlFor="looking" className="flex items-center space-x-2 cursor-pointer rounded-md border p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="looking" id="looking" />
                        <span>Looking for Teammates</span>
                      </Label>
                    </RadioGroup>

                    {formData.teamStatus === "existing" && (
                      <div className="mt-6 space-y-2">
                        <Label htmlFor="teamNameExisting">Team Name</Label>
                        <Input 
                          id="teamNameExisting"
                          name="teamName"
                          placeholder="Enter the name of the team you're joining"
                          value={formData.teamName || ""}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    )}
                    {formData.teamStatus === "new" && (
                      <div className="mt-6 space-y-2">
                        <Label htmlFor="teamNameNew">New Team Name</Label>
                        <Input 
                          id="teamNameNew"
                          name="teamName"
                          placeholder="Choose a name for your new team"
                          value={formData.teamName || ""}
                          onChange={handleInputChange}
                          required 
                        />
                        <Label htmlFor="teamMembers">Team Members (Emails, separated by commas)</Label>
                        <Textarea 
                          id="teamMembers"
                          name="teamMembers"
                          placeholder="invite@example.com, friend@example.com"
                          value={formData.teamMembers || ""}
                          onChange={handleInputChange} 
                        />
                      </div>
                    )}
                    {formData.teamStatus === "looking" && (
                      <div className="mt-6 space-y-2">
                        <Label htmlFor="lookingFor">What are you looking for in teammates?</Label>
                        <Textarea 
                          id="lookingFor"
                          name="lookingFor"
                          placeholder="Describe the skills or roles you're seeking (e.g., frontend developer, designer)" 
                          value={formData.lookingFor || ""}
                          onChange={handleInputChange} 
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePreviousStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button type="button" onClick={handleNextStep}>
                      {isFreeEvent ? "Confirm Registration" : "Next: Payment"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Step 3: Payment (Conditional) */}
              {currentStep === getCurrentStepIndex() && !isFreeEvent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Payment Details
                    </CardTitle>
                    <CardDescription>Complete the payment to finalize your registration.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {event?.registration_fee && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Registration Fee</p>
                        <p className={`text-3xl font-bold ${discountAmount > 0 ? 'line-through text-muted-foreground' : ''}`}>
                          ₹{event.registration_fee.toFixed(2)}
                        </p>
                        {discountAmount > 0 && discountedFee !== null && (
                          <p className="text-2xl font-bold text-primary">
                            Discounted Fee: ₹{discountedFee.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {userData && (
                      <PointDiscountSelector 
                        userId={userData.id} 
                        eventId={eventId} 
                        registrationFee={event?.registration_fee || 0}
                        onDiscountChange={handleDiscountChange} 
                      />
                    )}

                    {event?.upi_id && discountedFee !== null && discountedFee > 0 && (
                      <div className="text-center space-y-4">
                        <p className="text-muted-foreground">Pay using UPI:</p>
                        {generatedQRCode ? (
                          <div className="inline-block rounded-lg border p-4 bg-background">
                            <img src={generatedQRCode} alt="UPI Payment QR Code" className="w-48 h-48 mx-auto" />
                          </div>
                        ) : (
                          <p>Generating QR code...</p>
                        )}
                        <p className="text-sm font-medium">UPI ID: <span className="font-mono text-primary">{event.upi_id}</span></p>
                        <p className="text-sm text-muted-foreground">Amount: ₹{discountedFee.toFixed(2)}</p>
                      </div>
                    )}
                    
                    {/* Message if fee is zero after discount */}
                    {discountedFee === 0 && (
                      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-300">Registration Fee Covered!</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                          Your points discount covers the entire registration fee. You can proceed to the next step.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePreviousStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    {/* Show skip if fee is zero, otherwise show next */}
                    {discountedFee === 0 ? (
                       <Button type="button" onClick={handleNextStep}> {/* Should skip Verification step */}
                        Next: Confirmation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="button" onClick={handlePaymentComplete}> {/* Needs logic to check if QR was used */}
                        I&apos;ve Completed Payment
                        <Check className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )}

              {/* Step 4: Verify Payment (Conditional) */}
              {currentStep === getCurrentStepIndex() && !isFreeEvent && discountedFee !== 0 && (
                 <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clipboard className="mr-2 h-5 w-5" />
                      Verify Payment
                    </CardTitle>
                    <CardDescription>
                      Please provide the transaction details for verification.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID / Reference Number</Label>
                      <Input 
                        id="transactionId"
                        name="transactionId"
                        placeholder="Enter the ID from your UPI app (e.g., T123456789)" 
                        value={formData.transactionId || ""}
                        onChange={handleInputChange} 
                        required
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="paymentScreenshot">Upload Payment Screenshot (Optional)</Label>
                      <div className="flex items-center space-x-3">
                        <Input 
                          id="paymentScreenshot"
                          name="paymentScreenshot"
                          type="file"
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                        {paymentScreenshot && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                      {paymentScreenshot && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Preview:</p>
                          <img 
                            src={paymentScreenshot} 
                            alt="Payment screenshot preview" 
                            className="mt-1 max-w-xs rounded-md border max-h-40 object-contain"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Helps speed up verification if needed.
                      </p>
                    </div>
                     <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Verification Required</AlertTitle>
                      <AlertDescription>
                        Your registration will be marked as "Pending Payment" until the organizer verifies your transaction. This usually takes 24-48 hours.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePreviousStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous: Payment Details
                    </Button>
                    <Button type="button" onClick={handleNextStep}>
                      Next: Confirmation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === totalSteps && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Confirm Registration
                    </CardTitle>
                    <CardDescription>Review your details and submit your registration.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4 rounded-md border p-4">
                      <h3 className="font-medium flex items-center"><User className="mr-2 h-4 w-4"/>Personal Info</h3>
                      <p><span className="font-medium">Full Name:</span> {formData.fullName}</p>
                      <p><span className="font-medium">Email:</span> {formData.email}</p>
                      <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                      {formData.skills && <p><span className="font-medium">Skills:</span> {formData.skills}</p>}
                    </div>
                    
                    {eventAllowsTeams && (
                      <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-medium flex items-center"><Users className="mr-2 h-4 w-4"/>Team Preference</h3>
                        <p><span className="font-medium">Status:</span> {formData.teamStatus}</p>
                        {formData.teamName && <p><span className="font-medium">Team Name:</span> {formData.teamName}</p>}
                        {formData.teamMembers && <p><span className="font-medium">Members Invited:</span> {formData.teamMembers}</p>}
                        {formData.lookingFor && <p><span className="font-medium">Looking For:</span> {formData.lookingFor}</p>}
                      </div>
                    )}
                    
                    {!isFreeEvent && (
                      <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-medium flex items-center"><CreditCard className="mr-2 h-4 w-4"/>Payment Info</h3>
                        <p><span className="font-medium">Fee Status:</span> {discountedFee === 0 ? 'Covered by Points' : 'Payment Submitted'}</p>
                        {discountAmount > 0 && <p><span className="font-medium">Points Used:</span> {pointsToUse}</p>}
                        {discountAmount > 0 && <p><span className="font-medium">Discount Applied:</span> ₹{discountAmount.toFixed(2)}</p>}
                        {discountedFee !== null && discountedFee > 0 && (
                          <p><span className="font-medium">Amount Paid:</span> ₹{discountedFee.toFixed(2)}</p>
                        )}
                        {formData.transactionId && <p><span className="font-medium">Transaction ID:</span> {formData.transactionId}</p>}
                        {paymentScreenshot && <p><span className="font-medium">Screenshot Uploaded:</span> Yes</p>}
                      </div>
                    )}

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Final Step</AlertTitle>
                      <AlertDescription>
                        Clicking "Submit Registration" will finalize your entry. 
                        { !isFreeEvent && discountedFee !== 0 && " Your status will be 'Pending Payment' until verified."}
                        { isFreeEvent || discountedFee === 0 && " Your registration will be confirmed immediately."}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePreviousStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Registration"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </form>
          </div>

          {/* Sidebar: Event Details */}
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event?.banner_image && (
                  <div className="aspect-video overflow-hidden rounded-md">
                    <img 
                      src={event.banner_image} 
                      alt={sanitizeText(event.name)} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <h2 className="text-xl font-semibold">{sanitizeText(event?.name)}</h2>
                <p className="text-sm text-muted-foreground">{sanitizeText(event?.description)}</p>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(event?.start_date)} - {formatDate(event?.end_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{sanitizeText(event?.location)}</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Registration Fee: {isFreeEvent ? "Free" : `₹${event?.registration_fee?.toFixed(2)}`}</span>
                  </div>
                  {eventAllowsTeams && (
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Team Size: {event?.min_team_size || 1} - {event?.max_team_size} members</span>
                    </div>
                  )}
                </div>

                <Separator />

                {event?.registration_end_date && (
                  <div className="rounded-md border border-dashed p-3 text-center">
                    <p className="text-sm font-medium">Registration Deadline</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.registration_end_date)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Need Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Questions about registration or the event? Contact the organizers.
                </p>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}


// Helper React component needed because map cannot be used directly in Server Components for Progress Indicator

