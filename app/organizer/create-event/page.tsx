// EventSync/app/organizer/create-event/page.tsx
"use client"

// --- Imports ---
import { useState, type FormEvent, ChangeEvent, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Upload, QrCode, ArrowRight, ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import { useActionState } from 'react'
// Removed useFormStatus as we manage loading state manually

import { createEvent } from "./actions" // Import the server action
import type { CreateEventState } from "./actions" // Import the action's state type

// --- Component Imports ---
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/SiteHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


// --- Initial State for Action ---
const initialState: CreateEventState = {
  error: null,
  fieldErrors: {},
  message: null,
};

// --- Constants (Defined ONCE at module level) ---
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_BANNER_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_QR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];

// --- Form Data State Interface ---
interface FormDataState {
    title: string;
    description: string;
    banner?: File | null;
    eventType: 'online' | 'offline' | 'hybrid';
    location: string;
    maxParticipants: string; // Keep as string from input
    hasRegistrationFee: boolean;
    feeAmount: string; // Keep as string from input
    upiId: string;
    qrCode?: File | null;
    requirements: string;
    minTeamSize: string; // Keep as string from input
    maxTeamSize: string; // Keep as string from input
    registrationStart: string; // Keep as string from input
    registrationEnd: string; // Keep as string from input
    eventStart: string; // Keep as string from input
    eventEnd: string; // Keep as string from input
    resultsDate: string; // Keep as string from input
    prizes: string;
    rules: string;
    judgingCriteria: string;
}


// --- Main Component ---
export default function CreateEventPage() {
  const router = useRouter();
  const [state, formAction] = useActionState<CreateEventState, FormData>(createEvent, initialState);
  const [activeTab, setActiveTab] = useState("basic");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Manual loading state

  // Client-side state for ALL form fields
  const [formData, setFormData] = useState<FormDataState>({
    title: '',
    description: '',
    banner: null,
    eventType: 'online',
    location: '',
    maxParticipants: '',
    hasRegistrationFee: false,
    feeAmount: '',
    upiId: '',
    qrCode: null,
    requirements: '',
    minTeamSize: '1',
    maxTeamSize: '5',
    registrationStart: '',
    registrationEnd: '',
    eventStart: '',
    eventEnd: '',
    resultsDate: '',
    prizes: '',
    rules: '',
    judgingCriteria: '',
  });

   // Update state on input change
   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
       const { name, value, type } = e.target;

       if (type === 'file') {
            const { files } = e.target as HTMLInputElement;
            const file = files?.[0] || null;
             setFormData(prev => ({ ...prev, [name]: file })); // Store the File object
             if (name === 'banner') handleFilePreview(e as ChangeEvent<HTMLInputElement>, setBannerPreview);
             if (name === 'qrCode') handleFilePreview(e as ChangeEvent<HTMLInputElement>, setQrPreview);
       } else {
            setFormData(prev => ({ ...prev, [name]: value }));
       }
   }; // <<< Semicolon here is fine

    // Handler for RadioGroup
    const handleRadioChange = (name: keyof FormDataState, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value as any }));
    }; // <<< Semicolon here is fine

    // Handler for Switch
    const handleSwitchChange = (name: keyof FormDataState, checked: boolean) => {
         setFormData(prev => ({ ...prev, [name]: checked }));
    }; // <<< Semicolon here is fine

    // File Preview Handler
    const handleFilePreview = (e: ChangeEvent<HTMLInputElement>, setPreview: (url: string | null) => void) => {
        const file = e.target.files?.[0];
        if (!file) {
            setPreview(null);
            return;
        }
        // Client-side checks
        if (file.size > MAX_FILE_SIZE_BYTES) {
            alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
            e.target.value = ''; // Clear the input only if invalid
            setFormData(prev => ({ ...prev, [e.target.name]: null }));
            setPreview(null);
            return;
        }
        const allowedTypes = e.target.name === 'banner' ? ACCEPTED_BANNER_TYPES : ACCEPTED_QR_TYPES;
         if (!allowedTypes.includes(file.type)) {
             alert(`Invalid file type for ${e.target.name}. Allowed: ${allowedTypes.join(', ')}`);
             e.target.value = ''; // Clear the input only if invalid
             setFormData(prev => ({ ...prev, [e.target.name]: null }));
             setPreview(null);
             return;
         }
        // Read and set preview
        const reader = new FileReader();
        reader.onloadend = () => { setPreview(reader.result as string); };
        reader.readAsDataURL(file);
    }; // <<< Semicolon here is fine

  // Tab Navigation
  const handleNextTab = (nextTab: string) => { setActiveTab(nextTab); window.scrollTo(0, 0); }; // <<< Semicolon here is fine
  const handlePrevTab = (prevTab: string) => { setActiveTab(prevTab); window.scrollTo(0, 0); }; // <<< Semicolon here is fine

  // --- Manual Submit Handler ---
   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
       event.preventDefault();
       setIsSubmitting(true);
       state.error = null; // Clear previous errors before submitting
       state.fieldErrors = {};

       const manualFormData = new FormData();
       Object.entries(formData).forEach(([key, value]) => {
           if (key === 'hasRegistrationFee') {
               manualFormData.append(key, value ? 'on' : '');
           } else if (value instanceof File) {
               if (value) manualFormData.append(key, value);
           } else if (value !== null && value !== undefined) { // Append even empty strings for validation
                manualFormData.append(key, String(value));
           }
       });

        console.log("Manual FormData to be sent:", Object.fromEntries(manualFormData.entries()));

       await formAction(manualFormData); // Execute the server action

       setIsSubmitting(false); // Reset loading state
   }; // <<< Semicolon here is fine


   // --- Component Return Statement ---
  return ( // <-- This is line ~161
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-8">
             {/* Header and Error Display */}
              <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold tracking-tight">Create New Hackathon</h1>
                  <Link href="/organizer/dashboard"><Button variant="outline">Cancel</Button></Link>
              </div>
              {/* General Error */}
              {state?.error && Object.keys(state.fieldErrors || {}).length === 0 && (
                 <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert>
              )}
              {/* Success Message */}
             {state?.message && ( <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/30"><AlertCircle className="h-4 w-4" /><AlertTitle>Success</AlertTitle><AlertDescription>{state.message}</AlertDescription></Alert> )}


            <Card>
              {/* Use onSubmit, NOT action */}
              <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                     <TabsTrigger value="basic">Basic Info</TabsTrigger>
                     <TabsTrigger value="details">Details</TabsTrigger>
                     <TabsTrigger value="schedule">Schedule</TabsTrigger>
                     <TabsTrigger value="prizes">Prizes & Rules</TabsTrigger>
                  </TabsList>

                  {/* --- Basic Info Tab --- */}
                  <TabsContent value="basic" className="p-0" hidden={activeTab !== 'basic'}>
                    <CardContent className="space-y-6 p-6">
                      {/* Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input id="title" name="title" placeholder="e.g., AI Innovation Hackathon 2025" required
                               value={formData.title} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.title} />
                        {state?.fieldErrors?.title && <p className="text-xs text-destructive">{state.fieldErrors.title.join(', ')}</p>}
                      </div>
                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Describe your hackathon..." className="min-h-32" required
                                  value={formData.description} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.description} />
                         {state?.fieldErrors?.description && <p className="text-xs text-destructive">{state.fieldErrors.description.join(', ')}</p>}
                      </div>
                      {/* Banner Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="banner-upload">Event Banner</Label>
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="banner-upload" className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 ${state?.fieldErrors?.banner ? 'border-destructive' : 'border-input'}`}>
                            {bannerPreview ? ( <img src={bannerPreview} alt="Banner Preview" className="h-full w-auto object-contain p-2"/> ) : ( /* Placeholder */
                               <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, GIF (Max {MAX_FILE_SIZE_MB}MB)</p>
                               </div>
                             )}
                          </label>
                        </div>
                         <Input id="banner-upload" name="banner" type="file" className="sr-only" /* Visually hidden */
                               accept={ACCEPTED_BANNER_TYPES.join(',')}
                               onChange={handleChange} required aria-invalid={!!state?.fieldErrors?.banner} aria-describedby={state?.fieldErrors?.banner ? "banner-error" : undefined} />
                         {state?.fieldErrors?.banner && <p id="banner-error" className="text-xs text-destructive">{state.fieldErrors.banner.join(', ')}</p>}
                      </div>
                      {/* Event Type */}
                      <div className="space-y-2">
                        <Label>Event Type</Label>
                        <RadioGroup name="eventType" className="flex flex-col space-y-1" value={formData.eventType} onValueChange={(value) => handleRadioChange('eventType', value)}>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="online" id="online" /><Label htmlFor="online" className="font-normal">Online</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="offline" id="offline" /><Label htmlFor="offline" className="font-normal">Offline</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="hybrid" id="hybrid" /><Label htmlFor="hybrid" className="font-normal">Hybrid</Label></div>
                        </RadioGroup>
                         {state?.fieldErrors?.eventType && <p className="text-xs text-destructive">{state.fieldErrors.eventType.join(', ')}</p>}
                      </div>
                       {/* Location */}
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="e.g., San Francisco, CA or Online" required value={formData.location} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.location}/>
                        {state?.fieldErrors?.location && <p className="text-xs text-destructive">{state.fieldErrors.location.join(', ')}</p>}
                      </div>
                      {/* Max Participants */}
                      <div className="space-y-2">
                        <Label htmlFor="maxParticipants">Maximum Participants (Optional)</Label>
                        <Input id="maxParticipants" name="maxParticipants" type="number" min="1" placeholder="100" value={formData.maxParticipants} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.maxParticipants}/>
                        {state?.fieldErrors?.maxParticipants && <p className="text-xs text-destructive">{state.fieldErrors.maxParticipants.join(', ')}</p>}
                      </div>
                      {/* Registration Fee */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="hasRegistrationFee">Enable Registration Fee?</Label>
                          <Switch id="hasRegistrationFee" name="hasRegistrationFee" checked={formData.hasRegistrationFee} onCheckedChange={(checked) => handleSwitchChange('hasRegistrationFee', checked)} />
                        </div>
                         {state?.fieldErrors?.hasRegistrationFee && <p className="text-xs text-destructive">{state.fieldErrors.hasRegistrationFee.join(', ')}</p>}
                        {formData.hasRegistrationFee && (
                          <div className="space-y-4 mt-4 p-4 rounded-lg border">
                             <div className="space-y-2">
                                <Label htmlFor="feeAmount">Fee Amount ($)</Label>
                                <Input id="feeAmount" name="feeAmount" type="number" min="0.01" step="0.01" placeholder="25.00" required={formData.hasRegistrationFee} value={formData.feeAmount} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.feeAmount}/>
                                {state?.fieldErrors?.feeAmount && <p className="text-xs text-destructive">{state.fieldErrors.feeAmount.join(', ')}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="upiId">UPI ID</Label>
                                <Input id="upiId" name="upiId" placeholder="yourname@upi" required={formData.hasRegistrationFee} value={formData.upiId} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.upiId}/>
                                {state?.fieldErrors?.upiId && <p className="text-xs text-destructive">{state.fieldErrors.upiId.join(', ')}</p>}
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="qr-code-upload">QR Code (Optional)</Label>
                                <div className="flex items-center justify-center w-full">
                                  <label htmlFor="qr-code-upload" className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 ${state?.fieldErrors?.qrCode ? 'border-destructive' : 'border-input'}`}>
                                     {qrPreview ? ( <img src={qrPreview} alt="QR Preview" className="h-full w-auto object-contain p-2"/> ) : ( /* Placeholder */
                                         <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                              <QrCode className="w-8 h-8 mb-3 text-muted-foreground" />
                                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                              <p className="text-xs text-muted-foreground">PNG, JPG, SVG (Max {MAX_FILE_SIZE_MB}MB)</p>
                                          </div>
                                    )}
                                  </label>
                                </div>
                                 <Input id="qr-code-upload" name="qrCode" type="file" className="sr-only" accept={ACCEPTED_QR_TYPES.join(',')} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.qrCode} aria-describedby={state?.fieldErrors?.qrCode ? "qr-error" : undefined} />
                                 {state?.fieldErrors?.qrCode && <p id="qr-error" className="text-xs text-destructive">{state.fieldErrors.qrCode.join(', ')}</p>}
                             </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <div className="flex justify-end p-6 border-t">
                        <Button type="button" onClick={() => handleNextTab("details")}> Next: Details <ArrowRight className="ml-2 h-4 w-4" /> </Button>
                    </div>
                  </TabsContent>

                  {/* --- Details Tab --- */}
                   <TabsContent value="details" className="p-0" hidden={activeTab !== 'details'}>
                      <CardContent className="space-y-6 p-6">
                          {/* Requirements */}
                          <div className="space-y-2">
                            <Label htmlFor="requirements">Requirements (Optional)</Label>
                            <Textarea id="requirements" name="requirements" placeholder="List tech, APIs..." value={formData.requirements} onChange={handleChange} className="min-h-24" aria-invalid={!!state?.fieldErrors?.requirements}/>
                            {state?.fieldErrors?.requirements && <p className="text-xs text-destructive">{state.fieldErrors.requirements.join(', ')}</p>}
                          </div>
                           {/* Team Size */}
                           <div className="space-y-2">
                               <Label>Team Size</Label>
                               <div className="flex items-start gap-4">
                                   <div className="w-1/2 space-y-1">
                                        <Label htmlFor="minTeamSize" className="text-xs">Min</Label>
                                        <Input id="minTeamSize" name="minTeamSize" type="number" min="1" placeholder="1" required value={formData.minTeamSize} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.minTeamSize}/>
                                        {state?.fieldErrors?.minTeamSize && <p className="text-xs text-destructive">{state.fieldErrors.minTeamSize.join(', ')}</p>}
                                    </div>
                                   <div className="w-1/2 space-y-1">
                                        <Label htmlFor="maxTeamSize" className="text-xs">Max</Label>
                                        <Input id="maxTeamSize" name="maxTeamSize" type="number" min={formData.minTeamSize || "1"} placeholder="5" required value={formData.maxTeamSize} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.maxTeamSize}/>
                                        {state?.fieldErrors?.maxTeamSize && <p className="text-xs text-destructive">{state.fieldErrors.maxTeamSize.join(', ')}</p>}
                                   </div>
                               </div>
                               {/* Cross-field validation error */}
                               {state?.fieldErrors?._errors?.find(err => err.includes("Maximum team size")) && (
                                   <p className="text-xs text-destructive">{state.fieldErrors._errors.find(err => err.includes("Maximum team size"))}</p>
                               )}
                           </div>
                      </CardContent>
                      <div className="flex justify-between p-6 border-t">
                          <Button type="button" variant="outline" onClick={() => handlePrevTab("basic")}> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Button>
                          <Button type="button" onClick={() => handleNextTab("schedule")}> Next: Schedule <ArrowRight className="ml-2 h-4 w-4" /> </Button>
                      </div>
                  </TabsContent>

                  {/* --- Schedule Tab --- */}
                  <TabsContent value="schedule" className="p-0" hidden={activeTab !== 'schedule'}>
                     <CardContent className="space-y-6 p-6">
                        {/* Registration Start */}
                        <div className="space-y-2">
                          <Label htmlFor="registrationStart">Reg. Start Date</Label>
                          <Input id="registrationStart" name="registrationStart" type="date" required value={formData.registrationStart} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.registrationStart}/>
                           {state?.fieldErrors?.registrationStart && <p className="text-xs text-destructive">{state.fieldErrors.registrationStart.join(', ')}</p>}
                        </div>
                        {/* Registration End */}
                        <div className="space-y-2">
                          <Label htmlFor="registrationEnd">Reg. Deadline</Label>
                          <Input id="registrationEnd" name="registrationEnd" type="date" required value={formData.registrationEnd} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.registrationEnd}/>
                          {state?.fieldErrors?.registrationEnd && <p className="text-xs text-destructive">{state.fieldErrors.registrationEnd.join(', ')}</p>}
                           {/* Cross-field validation error */}
                           {state?.fieldErrors?._errors?.find(err => err.includes("Registration deadline")) && (
                               <p className="text-xs text-destructive">{state.fieldErrors._errors.find(err => err.includes("Registration deadline"))}</p>
                           )}
                        </div>
                         {/* Event Start */}
                        <div className="space-y-2">
                          <Label htmlFor="eventStart">Event Start Date & Time</Label>
                          <Input id="eventStart" name="eventStart" type="datetime-local" required value={formData.eventStart} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.eventStart}/>
                           {state?.fieldErrors?.eventStart && <p className="text-xs text-destructive">{state.fieldErrors.eventStart.join(', ')}</p>}
                        </div>
                         {/* Event End */}
                        <div className="space-y-2">
                          <Label htmlFor="eventEnd">Event End Date & Time</Label>
                          <Input id="eventEnd" name="eventEnd" type="datetime-local" required value={formData.eventEnd} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.eventEnd}/>
                          {state?.fieldErrors?.eventEnd && <p className="text-xs text-destructive">{state.fieldErrors.eventEnd.join(', ')}</p>}
                          {/* Cross-field validation error */}
                          {state?.fieldErrors?._errors?.find(err => err.includes("Event end date/time")) && (
                               <p className="text-xs text-destructive">{state.fieldErrors._errors.find(err => err.includes("Event end date/time"))}</p>
                           )}
                        </div>
                        {/* Results Date */}
                        <div className="space-y-2">
                          <Label htmlFor="resultsDate">Results Announcement Date</Label>
                          <Input id="resultsDate" name="resultsDate" type="date" required value={formData.resultsDate} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.resultsDate}/>
                          {state?.fieldErrors?.resultsDate && <p className="text-xs text-destructive">{state.fieldErrors.resultsDate.join(', ')}</p>}
                           {/* Cross-field validation error */}
                          {state?.fieldErrors?._errors?.find(err => err.includes("Results announcement date")) && (
                               <p className="text-xs text-destructive">{state.fieldErrors._errors.find(err => err.includes("Results announcement date"))}</p>
                           )}
                        </div>
                    </CardContent>
                    <div className="flex justify-between p-6 border-t">
                      <Button type="button" variant="outline" onClick={() => handlePrevTab("details")}> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Button>
                      <Button type="button" onClick={() => handleNextTab("prizes")}> Next: Prizes & Rules <ArrowRight className="ml-2 h-4 w-4" /> </Button>
                    </div>
                  </TabsContent>

                   {/* --- Prizes & Rules Tab --- */}
                  <TabsContent value="prizes" className="p-0" hidden={activeTab !== 'prizes'}>
                    <CardContent className="space-y-6 p-6">
                        {/* Prizes */}
                        <div className="space-y-2">
                            <Label htmlFor="prizes">Prizes</Label>
                            <Textarea id="prizes" name="prizes" placeholder="Describe prizes..." className="min-h-24" required value={formData.prizes} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.prizes}/>
                            {state?.fieldErrors?.prizes && <p className="text-xs text-destructive">{state.fieldErrors.prizes.join(', ')}</p>}
                        </div>
                         {/* Rules */}
                        <div className="space-y-2">
                            <Label htmlFor="rules">Rules & Guidelines</Label>
                            <Textarea id="rules" name="rules" placeholder="List rules..." className="min-h-32" required value={formData.rules} onChange={handleChange} aria-invalid={!!state?.fieldErrors?.rules}/>
                            {state?.fieldErrors?.rules && <p className="text-xs text-destructive">{state.fieldErrors.rules.join(', ')}</p>}
                        </div>
                    </CardContent>
                    <div className="flex justify-between p-6 border-t">
                      <Button type="button" variant="outline" onClick={() => handlePrevTab("schedule")}> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Button>
                       {/* Submit Button */}
                       <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating... </> ) : ( <> Create Hackathon <Save className="ml-2 h-4 w-4" /> </> )}
                       </Button>
                    </div>
                  </TabsContent>
                </Tabs>

              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} // <<< Make sure this closing brace is present