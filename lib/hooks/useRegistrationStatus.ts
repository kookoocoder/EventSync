"use client";

import { useState, useEffect } from 'react';
import createClient from '@/lib/supabase/client';

export type RegistrationStatus = {
  isRegistered: boolean;
  status: string | null;
  paymentStatus: string | null;
  registrationId: string | null;
  loading: boolean;
  error: string | null;
};

export function useRegistrationStatus(eventId: string | null) {
  const [status, setStatus] = useState<RegistrationStatus>({
    isRegistered: false,
    status: null,
    paymentStatus: null,
    registrationId: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!eventId) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    const checkRegistrationStatus = async () => {
      try {
        const supabase = createClient();
        const { data: session, error: authError } = await supabase.auth.getSession();

        if (authError || !session.session) {
          setStatus({
            isRegistered: false,
            status: null,
            paymentStatus: null,
            registrationId: null,
            loading: false,
            error: null
          });
          return;
        }

        const { data: registration, error: regError } = await supabase
          .from("registrations")
          .select("id, status, payment_status")
          .eq("event_id", eventId)
          .eq("participant_id", session.session.user.id)
          .maybeSingle();

        if (regError) {
          console.error("Error checking registration:", regError);
          setStatus({
            isRegistered: false,
            status: null,
            paymentStatus: null,
            registrationId: null,
            loading: false,
            error: regError.message
          });
          return;
        }

        if (registration) {
          setStatus({
            isRegistered: true,
            status: registration.status,
            paymentStatus: registration.payment_status,
            registrationId: registration.id,
            loading: false,
            error: null
          });
        } else {
          setStatus({
            isRegistered: false,
            status: null,
            paymentStatus: null,
            registrationId: null,
            loading: false,
            error: null
          });
        }
      } catch (err: any) {
        console.error("Error in useRegistrationStatus:", err);
        setStatus({
          isRegistered: false,
          status: null,
          paymentStatus: null,
          registrationId: null,
          loading: false,
          error: err.message || "Failed to check registration status"
        });
      }
    };

    checkRegistrationStatus();
  }, [eventId]);

  return status;
} 