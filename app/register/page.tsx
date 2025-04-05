// EventSync/app/register/page.tsx (Multi-step for Organizer)

"use client";

import React, { useState } from 'react'; // Import useState
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { register } from './actions'; // Import the server action
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Mail, Lock, UserCircle, Loader, Building, Link as LinkIcon, MapPinIcon, Info } from 'lucide-react'; // Add Building, LinkIcon, MapPinIcon, Info
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components

interface RegisterState { error: string | null; }
const initialState: RegisterState = { error: null };

// Separate button component for clarity
function SubmitButton({ isOrganizerStep2 }: { isOrganizerStep2: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending} aria-disabled={pending}>
            {pending ? (
                <><Loader className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
            ) : (
                isOrganizerStep2 ? 'Complete Registration' : 'Sign up'
            )}
        </Button>
    );
}

export default function RegisterPage() {
    const [state, formAction] = useActionState<RegisterState, FormData>(register, initialState);
    const [userType, setUserType] = React.useState<'organizer' | 'participant'>('participant');
    const [step, setStep] = React.useState(1); // 1 for basic info, 2 for organizer details

    // State for form inputs (needed for validation before step change)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    // Organizer specific state
    const [orgName, setOrgName] = useState('');
    const [orgAddress, setOrgAddress] = useState('');
    const [orgWebsite, setOrgWebsite] = useState('');
    const [orgDescription, setOrgDescription] = useState('');

    const [clientError, setClientError] = useState<string | null>(null); // For client-side validation errors

    const handleNextStep = () => {
        setClientError(null); // Clear previous errors
        // Basic validation for step 1
        if (!email || !email.includes('@')) {
            setClientError('Please enter a valid email address.'); return;
        }
        if (!password || password.length < 6) {
            setClientError('Password must be at least 6 characters long.'); return;
        }
        if (!name || name.trim().length === 0) {
            setClientError('Please enter your full name.'); return;
        }
        // If validation passes
        setStep(2);
    };

    const handleBackStep = () => {
        setClientError(null); // Clear errors when going back
        setStep(1);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-lg"> {/* Increased max-width */}
                 <CardHeader className="text-center">
                    <CardTitle className="text-2xl lg:text-3xl font-bold">
                        {step === 1 ? 'Create Your Account' : 'Organizer Information'}
                    </CardTitle>
                     <CardDescription>
                         {step === 1 ? (
                             <>Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></>
                         ) : (
                             'Tell us more about your organization.'
                         )}
                     </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Display Server Errors */}
                    {state?.error && !clientError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                    {/* Display Client Errors */}
                    {clientError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{clientError}</AlertDescription>
                        </Alert>
                    )}

                    <form action={formAction} className="space-y-6">

                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-5 w-5 text-muted-foreground" /></div>
                                        <Input id="email" name="email" type="email" autoComplete="email" required className="pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                                    </div>
                                </div>
                                {/* Full Name */}
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><UserCircle className="h-5 w-5 text-muted-foreground" /></div>
                                        <Input id="name" name="name" type="text" autoComplete="name" required className="pl-10" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                </div>
                                {/* Password */}
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-5 w-5 text-muted-foreground" /></div>
                                        <Input id="password" name="password" type="password" autoComplete="new-password" required className="pl-10" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
                                </div>
                                {/* Account Type */}
                                <div>
                                    <Label>Account Type</Label>
                                    <input type="hidden" name="userType" value={userType} />
                                    <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'organizer' | 'participant')} className="mt-2 grid grid-cols-2 gap-4"> {/* Grid layout */}
                                        <Label htmlFor="participant" className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${userType === 'participant' ? 'border-primary' : ''}`}>
                                            <RadioGroupItem value="participant" id="participant" className="sr-only" />
                                             Participant
                                             <span className="block text-xs font-normal text-muted-foreground mt-1">Join and compete in hackathons.</span>
                                        </Label>
                                        <Label htmlFor="organizer" className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${userType === 'organizer' ? 'border-primary' : ''}`}>
                                             <RadioGroupItem value="organizer" id="organizer" className="sr-only" />
                                              Organizer
                                              <span className="block text-xs font-normal text-muted-foreground mt-1">Host and manage hackathons.</span>
                                        </Label>
                                    </RadioGroup>
                                </div>
                            </div>
                        )}

                         {/* Step 2: Organizer Details */}
                        {step === 2 && userType === 'organizer' && (
                             <div className="space-y-4">
                                 {/* Organization Name */}
                                <div>
                                    <Label htmlFor="organizationName">Organization Name</Label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Building className="h-5 w-5 text-muted-foreground" /></div>
                                        <Input id="organizationName" name="organizationName" type="text" required className="pl-10" placeholder="Your Company or Group" value={orgName} onChange={e => setOrgName(e.target.value)} />
                                    </div>
                                </div>
                                 {/* Organization Address (Optional) */}
                                <div>
                                    <Label htmlFor="organizationAddress">Organization Address <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MapPinIcon className="h-5 w-5 text-muted-foreground" /></div>
                                        <Input id="organizationAddress" name="organizationAddress" type="text" className="pl-10" placeholder="123 Innovation Drive, City" value={orgAddress} onChange={e => setOrgAddress(e.target.value)} />
                                    </div>
                                </div>
                                 {/* Organization Website (Optional) */}
                                <div>
                                    <Label htmlFor="organizationWebsite">Organization Website <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><LinkIcon className="h-5 w-5 text-muted-foreground" /></div>
                                        <Input id="organizationWebsite" name="organizationWebsite" type="url" className="pl-10" placeholder="https://your-organization.com" value={orgWebsite} onChange={e => setOrgWebsite(e.target.value)} />
                                    </div>
                                </div>
                                 {/* Organization Description (Optional) */}
                                <div>
                                    <Label htmlFor="organizationDescription">Organization Description <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                    <Textarea id="organizationDescription" name="organizationDescription" className="mt-1 min-h-[80px]" placeholder="Briefly describe your organization or group..." value={orgDescription} onChange={e => setOrgDescription(e.target.value)} />
                                </div>
                                 {/* Hidden fields from step 1 needed for final submission */}
                                 <input type="hidden" name="email" value={email} />
                                 <input type="hidden" name="password" value={password} />
                                 <input type="hidden" name="name" value={name} />
                                 <input type="hidden" name="userType" value={userType} />
                             </div>
                        )}

                        {/* Button Area */}
                        <div className="flex gap-3 pt-2">
                            {step === 2 && (
                                <Button type="button" variant="outline" onClick={handleBackStep} className="flex-1">Back</Button>
                            )}

                            {userType === 'participant' && step === 1 && (
                                <SubmitButton isOrganizerStep2={false} />
                            )}

                            {userType === 'organizer' && step === 1 && (
                                <Button type="button" onClick={handleNextStep} className="w-full">Next</Button>
                            )}

                            {userType === 'organizer' && step === 2 && (
                                <SubmitButton isOrganizerStep2={true} />
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}