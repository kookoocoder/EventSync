"use client"

import { useState, type FormEvent, type ChangeEvent, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Check, CreditCard, Info, MapPin, Upload, Users, AlertTriangle } from "lucide-react"
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
    // Removed experience, motivation
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

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: dbError } = await supabase
          .from("events")
          .select("id, name, description, start_date, end_date, location, registration_fee, min_team_size, max_team_size, registration_end_date, banner_image, upi_id")
          .eq("id", eventId)
          .single();
        
        if (dbError) throw dbError;
        if (!data) throw new Error("Event not found");
        
        setEvent(data as EventData);
        
        // Generate QR code if this is a paid event with UPI ID
        if (data.registration_fee && Number(data.registration_fee) > 0 && data.upi_id) {
          const qrCode = await generateQRCode(data.upi_id, data.registration_fee.toString());
          setGeneratedQRCode(qrCode);
        }
        
        // Auto-complete payment for free events
        if (!data.registration_fee || Number(data.registration_fee) <= 0) {
          setPaymentComplete(true);
        }

        // Set initial team status based on event config
        if (!((data.max_team_size ?? 1) > 1)) {
          setFormData(prev => ({ ...prev, teamStatus: 'solo' }));
        } else {
          // If teams are allowed, default might be looking or solo based on preference
          setFormData(prev => ({ ...prev, teamStatus: 'looking' })); 
        }

      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    
    // Authentication check
    const checkAuth = async () => {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.getSession();
      
      if (authError || !data.session) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.push('/login?message=Please log in to register for the event');
      }
    };
    
    checkAuth();
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
      const completeFormData: RegistrationFormData = {
        fullName: formData.fullName || "",
        email: formData.email || "",
        phone: formData.phone || "",
        skills: formData.skills || "",
        teamStatus: eventAllowsTeams ? (formData.teamStatus || 'solo') : 'solo',
        teamName: eventAllowsTeams && formData.teamStatus === 'have-team' ? formData.teamName : undefined,
        teamMembers: eventAllowsTeams && formData.teamStatus === 'have-team' ? formData.teamMembers : undefined,
        lookingFor: eventAllowsTeams && formData.teamStatus === 'looking' ? formData.lookingFor : undefined,
        paymentScreenshot: paymentScreenshot, // Pass null if free
        transactionId: formData.transactionId || undefined,
        // Removed experience, motivation
      };
      
      const result = await registerForEvent(eventId, completeFormData);
      
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

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
            <p>Loading event details...</p>
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
      <div className="container mx-auto max-w-6xl py-8 px-4 mt-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event
        </Button>
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold tracking-tight">Register for {event.name}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
             {steps.map((label, index) => (
               <React.Fragment key={label}>
                 {renderStepIndicator(index + 1, label)}
                 {index < steps.length - 1 && <Separator orientation="horizontal" className="w-8 mx-2 hidden sm:block" />}
               </React.Fragment>
             ))}
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <form onSubmit={handleSubmit}>
                  {currentStep === stepMap["Personal Info"] && (
                    <>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
Please provide your contact details and relevant skills.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" placeholder="Your Full Name" required value={formData.fullName} onChange={handleInputChange} autoComplete="name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" placeholder="your.email@example.com" required value={formData.email} onChange={handleInputChange} autoComplete="email" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required value={formData.phone} onChange={handleInputChange} autoComplete="tel" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="skills">Relevant Skills</Label>
                          <Textarea
                            id="skills"
                            placeholder="List your relevant skills, separated by commas (e.g., React, Node.js, Project Management)"
                            className="min-h-24"
                            required
                            value={formData.skills}
                            onChange={handleInputChange}
                          />
                           <p className="text-xs text-muted-foreground">This helps organizers and potential teammates understand your expertise.</p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button type="button" onClick={handleNextStep}>
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
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Registration Fee: ${event.registration_fee}</AlertTitle>
                          <AlertDescription>
                            Follow the instructions below to pay the registration fee.
                          </AlertDescription>
                        </Alert>

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
                            <p>Amount: ${event.registration_fee}</p>
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
                            <p><strong>Fee:</strong> {isFreeEvent ? "Free Event" : `$${event.registration_fee} (Pending Verification)`}</p>
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

            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.banner_image && (
                    <div className="aspect-video relative overflow-hidden rounded-md bg-muted">
                      <img src={event.banner_image} alt={event.name} className="w-full h-full object-cover" />
                  </div>
                  )}
                  <h3 className="text-xl font-semibold pt-2">{event.name}</h3>
                  {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{event.location || "Online"}</span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>Fee: {isFreeEvent ? "Free" : `$${event.registration_fee}`}</span>
                    </div>
                    {eventAllowsTeams && (
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>Team Size: {event.min_team_size || 1} - {event.max_team_size || 4} members</span>
                    </div>
                    )}
                  </div>
                  <Separator />
                  <div className="rounded-lg bg-muted p-3">
                    <h4 className="font-medium mb-1 text-sm">Registration Deadline</h4>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{formatDate(event.registration_end_date)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Questions about registration or the event? Contact the organizers.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/">Contact Support (Placeholder)</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex-grow"></div>
      </div>
    </>
  );
}


// Helper React component needed because map cannot be used directly in Server Components for Progress Indicator

