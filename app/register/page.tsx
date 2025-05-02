// EventSync/app/register/page.tsx (Multi-step for Organizer)

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { register } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Lock, 
  UserCircle, 
  Loader, 
  Building, 
  Link as LinkIcon, 
  MapPin, 
  Info, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle,
  Shield
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface RegisterState { error: string | null; }
const initialState: RegisterState = { error: null };

// Separate button component for clarity
function SubmitButton({ isOrganizerStep2 }: { isOrganizerStep2: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={pending} aria-disabled={pending}>
            {pending ? (
                <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />Processing...</>
            ) : (
                isOrganizerStep2 ? (
                  <>Complete Registration <CheckCircle className="ml-2 h-4 w-4" /></>
                ) : (
                  <>Sign up <ArrowRight className="ml-2 h-4 w-4" /></>
                )
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
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 bg-gradient-to-b from-muted/30 to-transparent">
            <div className="w-full max-w-lg">
                {/* Progress indicator for multi-step form (only for organizer) */}
                {userType === 'organizer' && (
                    <div className="mb-6 relative pt-2">
                        <div className="flex justify-between mb-2">
                            <div 
                                className={`flex flex-col items-center relative ${
                                    step >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'
                                }`}
                                style={{ width: '50%' }}
                            >
                                <div className={`
                                    flex items-center justify-center w-8 h-8 rounded-full mb-2
                                    ${step > 1 
                                        ? 'bg-primary text-primary-foreground' 
                                        : step === 1 
                                            ? 'bg-primary text-white ring-4 ring-primary/20' 
                                            : 'bg-muted text-muted-foreground'}
                                `}>
                                    {step > 1 ? <Check className="h-4 w-4" /> : 1}
                                </div>
                                <span className="text-xs text-center sm:text-sm">Account Details</span>
                            </div>
                            <div 
                                className={`flex flex-col items-center relative ${
                                    step >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'
                                }`}
                                style={{ width: '50%' }}
                            >
                                <div className={`
                                    flex items-center justify-center w-8 h-8 rounded-full mb-2
                                    ${step > 2 
                                        ? 'bg-primary text-primary-foreground' 
                                        : step === 2 
                                            ? 'bg-primary text-white ring-4 ring-primary/20' 
                                            : 'bg-muted text-muted-foreground'}
                                `}>
                                    {step > 2 ? <Check className="h-4 w-4" /> : 2}
                                </div>
                                <span className="text-xs text-center sm:text-sm">Organization Info</span>
                            </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-muted h-1 rounded-full absolute top-6 left-0 -z-10">
                            <div 
                                className="h-full bg-primary rounded-full transition-all duration-300" 
                                style={{ width: `${((step - 1) / 1) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <Card className="shadow-lg border-muted/60 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-b from-primary/5 to-transparent">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl lg:text-3xl font-bold text-center flex items-center justify-center gap-2">
                                {step === 1 ? (
                                    <>
                                        <Shield className="h-6 w-6 text-primary" />
                                        Create Your Account
                                    </>
                                ) : (
                                    <>
                                        <Building className="h-6 w-6 text-primary" />
                                        Organizer Information
                                    </>
                                )}
                            </CardTitle>
                            <CardDescription className="text-center">
                                {step === 1 ? (
                                    <>Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></>
                                ) : (
                                    'Tell us more about your organization.'
                                )}
                            </CardDescription>
                        </CardHeader>
                    </div>

                    <CardContent className="pt-6 pb-4">
                        {/* Display Server Errors */}
                        {state?.error && !clientError && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertTitle>Registration Error</AlertTitle>
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}
                        {/* Display Client Errors */}
                        {clientError && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertTitle>Validation Error</AlertTitle>
                                <AlertDescription>{clientError}</AlertDescription>
                            </Alert>
                        )}

                        <form action={formAction} className="space-y-6">
                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    {/* Email */}
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                        <div className="relative mt-1.5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Mail className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <Input 
                                                id="email" 
                                                name="email" 
                                                type="email" 
                                                autoComplete="email" 
                                                required 
                                                className="pl-10 py-5 border-muted focus:border-primary focus:ring-primary" 
                                                placeholder="you@example.com" 
                                                value={email} 
                                                onChange={e => setEmail(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Full Name */}
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                                        <div className="relative mt-1.5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <UserCircle className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <Input 
                                                id="name" 
                                                name="name" 
                                                type="text" 
                                                autoComplete="name" 
                                                required 
                                                className="pl-10 py-5 border-muted focus:border-primary focus:ring-primary" 
                                                placeholder="Your Name" 
                                                value={name} 
                                                onChange={e => setName(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Password */}
                                    <div>
                                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                        <div className="relative mt-1.5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Lock className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <Input 
                                                id="password" 
                                                name="password" 
                                                type="password" 
                                                autoComplete="new-password" 
                                                required 
                                                className="pl-10 py-5 border-muted focus:border-primary focus:ring-primary" 
                                                placeholder="••••••••" 
                                                value={password} 
                                                onChange={e => setPassword(e.target.value)} 
                                            />
                                        </div>
                                        <p className="mt-1.5 text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
                                    </div>
                                    
                                    {/* Account Type */}
                                    <div className="pt-2">
                                        <Label className="text-sm font-medium">Account Type</Label>
                                        <input type="hidden" name="userType" value={userType} />
                                        <RadioGroup 
                                            value={userType} 
                                            onValueChange={(value) => setUserType(value as 'organizer' | 'participant')} 
                                            className="mt-2.5 grid grid-cols-2 gap-4"
                                        >
                                            <Label 
                                                htmlFor="participant" 
                                                className={`flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 
                                                    hover:bg-accent hover:text-accent-foreground transition-colors
                                                    ${userType === 'participant' ? 'border-primary bg-primary/5' : ''}`}
                                            >
                                                <RadioGroupItem value="participant" id="participant" className="sr-only" />
                                                <UserCircle className="h-8 w-8 mb-2 text-primary" />
                                                <span className="font-medium">Participant</span>
                                                <span className="block text-xs font-normal text-muted-foreground mt-1">
                                                    Join and participate in events.
                                                </span>
                                            </Label>
                                            <Label 
                                                htmlFor="organizer" 
                                                className={`flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 
                                                    hover:bg-accent hover:text-accent-foreground transition-colors
                                                    ${userType === 'organizer' ? 'border-primary bg-primary/5' : ''}`}
                                            >
                                                <RadioGroupItem value="organizer" id="organizer" className="sr-only" />
                                                <Building className="h-8 w-8 mb-2 text-primary" />
                                                <span className="font-medium">Organizer</span>
                                                <span className="block text-xs font-normal text-muted-foreground mt-1">
                                                    Host and manage events.
                                                </span>
                                            </Label>
                                        </RadioGroup>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Organizer Details */}
                            {step === 2 && userType === 'organizer' && (
                                <div className="space-y-5">
                                    {/* Organization Name */}
                                    <div>
                                        <Label htmlFor="organizationName" className="text-sm font-medium">Organization Name</Label>
                                        <div className="relative mt-1.5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Building className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <Input 
                                                id="organizationName" 
                                                name="organizationName" 
                                                type="text" 
                                                required 
                                                className="pl-10 py-5 border-muted focus:border-primary focus:ring-primary" 
                                                placeholder="Your Company or Group" 
                                                value={orgName} 
                                                onChange={e => setOrgName(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Organization Address (Optional) */}
                                    <div>
                                        <Label htmlFor="organizationAddress" className="text-sm font-medium">
                                            Organization Address <span className="text-xs text-muted-foreground">(Optional)</span>
                                        </Label>
                                        <div className="relative mt-1.5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <Input 
                                                id="organizationAddress" 
                                                name="organizationAddress" 
                                                type="text" 
                                                className="pl-10 py-5 border-muted focus:border-primary focus:ring-primary" 
                                                placeholder="123 Innovation Drive, City" 
                                                value={orgAddress} 
                                                onChange={e => setOrgAddress(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Organization Website (Optional) */}
                                    <div>
                                        <Label htmlFor="organizationWebsite" className="text-sm font-medium">
                                            Organization Website <span className="text-xs text-muted-foreground">(Optional)</span>
                                        </Label>
                                        <div className="relative mt-1.5">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <Input 
                                                id="organizationWebsite" 
                                                name="organizationWebsite" 
                                                type="url" 
                                                className="pl-10 py-5 border-muted focus:border-primary focus:ring-primary" 
                                                placeholder="https://your-organization.com" 
                                                value={orgWebsite} 
                                                onChange={e => setOrgWebsite(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Organization Description (Optional) */}
                                    <div>
                                        <Label htmlFor="organizationDescription" className="text-sm font-medium">
                                            Organization Description <span className="text-xs text-muted-foreground">(Optional)</span>
                                        </Label>
                                        <Textarea 
                                            id="organizationDescription" 
                                            name="organizationDescription" 
                                            className="mt-1.5 min-h-[120px] resize-y border-muted focus:border-primary focus:ring-primary" 
                                            placeholder="Briefly describe your organization or group..." 
                                            value={orgDescription} 
                                            onChange={e => setOrgDescription(e.target.value)} 
                                        />
                                    </div>
                                    
                                    {/* Hidden fields from step 1 needed for final submission */}
                                    <input type="hidden" name="email" value={email} />
                                    <input type="hidden" name="password" value={password} />
                                    <input type="hidden" name="name" value={name} />
                                    <input type="hidden" name="userType" value={userType} />
                                </div>
                            )}

                            {/* Button Area */}
                            <div className="pt-2">
                                {step === 2 && (
                                    <div className="flex gap-3">
                                        <Button type="button" variant="outline" onClick={handleBackStep} className="flex-1">
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                        </Button>
                                        <SubmitButton isOrganizerStep2={true} />
                                    </div>
                                )}

                                {userType === 'participant' && step === 1 && (
                                    <SubmitButton isOrganizerStep2={false} />
                                )}

                                {userType === 'organizer' && step === 1 && (
                                    <Button 
                                        type="button" 
                                        onClick={handleNextStep} 
                                        className="w-full bg-primary hover:bg-primary/90"
                                    >
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>

                    <div className="bg-muted/20 px-6 py-4 rounded-b-xl">
                        <p className="text-center text-xs text-muted-foreground">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}