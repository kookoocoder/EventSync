"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useRegistrationStatus } from '@/lib/hooks/useRegistrationStatus';
import createClient from '@/lib/supabase/client';

export interface RegistrationButtonProps {
  eventId: string;
  isLive?: boolean;
  isPast?: boolean;
  eventType?: 'events' | 'specialized';
  buttonSize?: 'default' | 'sm' | 'lg';
  className?: string;
  showStatus?: boolean;
  fullWidth?: boolean;
}

export function RegistrationButton({
  eventId,
  isLive = false,
  isPast = false,
  eventType = 'events',
  buttonSize = 'default',
  className = '',
  showStatus = true,
  fullWidth = true
}: RegistrationButtonProps) {
  const router = useRouter();
  const { isRegistered, status, paymentStatus, registrationId, loading, error } = useRegistrationStatus(eventId);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // Show loading indicator while checking auth status and registration
  if (loading || checkingAuth) {
    return (
      <Button 
        className={fullWidth ? "w-full " + className : className} 
        size={buttonSize} 
        variant="outline" 
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
      </Button>
    );
  }

  // If past event, show view results
  if (isPast) {
    return (
      <Button 
        className={fullWidth ? "w-full " + className : className} 
        size={buttonSize} 
        variant="outline" 
        asChild
      >
        <Link href={`/${eventType}/${eventId}/results`}>View Results</Link>
      </Button>
    );
  }

  // If not logged in, show login to register
  if (!isLoggedIn) {
    return (
      <Button 
        className={fullWidth ? "w-full " + className : className} 
        size={buttonSize} 
        asChild
      >
        <Link href={`/login?redirectTo=/${eventType}/${eventId}`}>
          Login to Register
        </Link>
      </Button>
    );
  }

  // If registration exists with any status, show appropriate message
  if (isRegistered) {
    // Registration is approved
    if (status === 'approved') {
      return (
        <div className={`${fullWidth ? "w-full" : ""} space-y-2 ${showStatus ? "" : "inline-block"}`}>
          {showStatus && (
            <Badge className="w-full bg-green-500 text-white py-1.5 text-center flex items-center justify-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Registration Approved
            </Badge>
          )}
          <Button 
            className={fullWidth ? "w-full " + className : className} 
            size={buttonSize} 
            variant={showStatus ? "outline" : "secondary"}
            asChild
          >
            <Link href="/participant/dashboard">
              {isLive ? "Join Event" : "View Registration"}
            </Link>
          </Button>
        </div>
      );
    }

    // Registration is rejected
    if (status === 'rejected') {
      return (
        <div className={`${fullWidth ? "w-full" : ""} space-y-2 ${showStatus ? "" : "inline-block"}`}>
          {showStatus && (
            <Badge className="w-full bg-red-500 text-white py-1.5 text-center flex items-center justify-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> Registration Rejected
            </Badge>
          )}
          <Button 
            className={fullWidth ? "w-full " + className : className} 
            size={buttonSize} 
            variant="outline" 
            asChild
          >
            <Link href="/participant/dashboard">View Details</Link>
          </Button>
        </div>
      );
    }

    // Registration is pending
    if (status === 'pending') {
      const message = paymentStatus === 'pending'
        ? "Payment Verification Pending"
        : "Approval Pending";
      return (
        <div className={`${fullWidth ? "w-full" : ""} space-y-2`}>
          {showStatus && (
            <Badge className="w-full bg-yellow-500 text-white py-1.5 text-center flex items-center justify-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {message}
            </Badge>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className={fullWidth ? "w-full " + className : className} 
                size={buttonSize} 
                variant={showStatus ? "outline" : "secondary"}
              >
                View Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Registration Status</DialogTitle>
              <div className="mt-4 text-muted-foreground text-sm space-y-2">
                <div><strong>Status:</strong> {status.charAt(0).toUpperCase() + status.slice(1)}</div>
                {paymentStatus && (
                  <div><strong>Payment Status:</strong> {paymentStatus}</div>
                )}
                {registrationId && (
                  <div><strong>Registration ID:</strong> {registrationId}</div>
                )}
              </div>
              <DialogClose asChild>
                <Button className="mt-4">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
  }

  // Default case: Not registered yet
  return (
    <Button 
      className={fullWidth ? "w-full " + className : className} 
      size={buttonSize} 
      asChild
    >
      <Link href={`/${eventType}/${eventId}/register`}>
        {isLive ? "Join Now" : "Register"}
      </Link>
    </Button>
  );
} 