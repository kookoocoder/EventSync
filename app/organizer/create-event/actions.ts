// EventSync/app/organizer/create-event/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createServerActionClient, createServiceRoleClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

// Define the shape of the state returned by the action
interface CreateEventState {
    error?: string | null;
    fieldErrors?: Record<string, string[] | undefined>;
    message?: string | null;
}

// --- File Validation Helpers ---
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_BANNER_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_QR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];

// --- Regex for datetime-local format (YYYY-MM-DDTHH:MM) ---
const dateTimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

// --- Validation Schema (Adjusted Date/Time Handling) ---
const eventSchema = z.object({
    // Basic Info
    title: z.string({ required_error: "Title is required." }).trim().min(3, 'Title must be at least 3 characters long.'),
    description: z.string({ required_error: "Description is required." }).trim().min(10, 'Description must be at least 10 characters long.'),
    banner: z.instanceof(File, { message: 'Banner image is required.' })
        .refine((file) => file.size > 0, 'Banner image cannot be empty.')
        .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, `Banner size must be less than ${MAX_FILE_SIZE_MB}MB.`)
        .refine((file) => ACCEPTED_BANNER_TYPES.includes(file.type), 'Invalid banner file type (JPG, PNG, WEBP, GIF).'),
    eventType: z.enum(['online', 'offline', 'hybrid'], { required_error: 'Event type is required.' }),
    location: z.string({ required_error: "Location is required." }).trim().min(3, 'Location must be at least 3 characters long.'),
    maxParticipants: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? null : val),
        z.coerce.number({ invalid_type_error: 'Max participants must be a valid number.'}).int().positive('Maximum participants must be a positive whole number.').nullable().optional()
    ),
    hasRegistrationFee: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
    feeAmount: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? null : val),
        z.coerce.number({ invalid_type_error: 'Fee amount must be a valid number.'}).positive('Fee amount must be positive.').nullable().optional()
    ),
    upiId: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? null : String(val).trim()),
        z.string().nullable().optional()
    ),
    qrCode: z.instanceof(File).optional()
        .refine((file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE_BYTES, `QR Code size must be less than ${MAX_FILE_SIZE_MB}MB.`)
        .refine((file) => !file || file.size === 0 || ACCEPTED_QR_TYPES.includes(file.type), 'Invalid QR code file type (JPG, PNG, SVG).'),

    // Details
    requirements: z.string().optional().nullable(),
    minTeamSize: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 1 : val),
        z.coerce.number({ required_error: 'Min team size is required.', invalid_type_error: 'Min team size must be a number.'}).int().min(1, 'Minimum team size must be at least 1.')
    ),
    maxTeamSize: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 1 : val),
        z.coerce.number({ required_error: 'Max team size is required.', invalid_type_error: 'Max team size must be a number.'}).int().min(1, 'Maximum team size must be at least 1.')
    ),

    // Schedule - Validate as strings first
     registrationStart: z.string({ required_error: 'Registration start date is required.'})
                         .date('Invalid date format for registration start (YYYY-MM-DD).'),
     registrationEnd: z.string({ required_error: 'Registration deadline is required.'})
                       .date('Invalid date format for registration deadline (YYYY-MM-DD).'),
     eventStart: z.string({ required_error: 'Event start date/time is required.'})
                  .regex(dateTimeLocalRegex, 'Invalid format for event start (YYYY-MM-DDTHH:MM).'),
     eventEnd: z.string({ required_error: 'Event end date/time is required.'})
                .regex(dateTimeLocalRegex, 'Invalid format for event end (YYYY-MM-DDTHH:MM).'),
     resultsDate: z.string({ required_error: 'Results announcement date is required.'})
                   .date('Invalid date format for results announcement (YYYY-MM-DD).'),

    // Prizes & Rules
    prizes: z.string({ required_error: "Prize description is required." }).trim().min(5, 'Prize description must be at least 5 characters.'),
    rules: z.string({ required_error: "Rules are required." }).trim().min(10, 'Rules must be at least 10 characters long.'),

}).refine((data) => {
    try {
        const regStartDate = new Date(data.registrationStart);
        const regEndDate = new Date(data.registrationEnd);
        const eventStartDate = new Date(data.eventStart);
        const eventEndDate = new Date(data.eventEnd);
        const resultsAnnounceDate = new Date(data.resultsDate);

        if (isNaN(regStartDate.getTime())) return { message: "Invalid registration start date.", path: ["registrationStart"] };
        if (isNaN(regEndDate.getTime())) return { message: "Invalid registration end date.", path: ["registrationEnd"] };
        if (isNaN(eventStartDate.getTime())) return { message: "Invalid event start date/time.", path: ["eventStart"] };
        if (isNaN(eventEndDate.getTime())) return { message: "Invalid event end date/time.", path: ["eventEnd"] };
        if (isNaN(resultsAnnounceDate.getTime())) return { message: "Invalid results announcement date.", path: ["resultsDate"] };


        if (regEndDate < regStartDate) return { message: "Registration deadline must be on or after the start date.", path: ["registrationEnd"] };
        if (eventEndDate < eventStartDate) return { message: "Event end date/time must be on or after the start date/time.", path: ["eventEnd"] };
        if (resultsAnnounceDate < eventEndDate) return { message: "Results announcement date must be on or after the event ends.", path: ["resultsDate"] };
    } catch (e) {
         return { message: "Error comparing dates.", path: ["registrationStart"] };
    }

    if (data.maxTeamSize < data.minTeamSize) return { message: "Maximum team size cannot be less than minimum team size.", path: ["maxTeamSize"] };
    if (data.hasRegistrationFee && (!data.feeAmount || data.feeAmount <= 0)) return { message: "A positive fee amount is required.", path: ["feeAmount"] };
    if (data.hasRegistrationFee && (!data.upiId || data.upiId.trim() === '')) return { message: "UPI ID is required.", path: ["upiId"] };
    if (!data.banner || data.banner.size === 0) return { message: "Banner image is required.", path: ["banner"] };

    return true;
}, {
    message: "Cross-field validation failed.",
});


// --- Helper Function for File Upload ---
async function uploadFile(
    supabaseService: ReturnType<typeof createServiceRoleClient>,
    file: File | undefined | null,
    bucket: string,
    organizerId: string
): Promise<string | null> {
    if (!file || file.size === 0) return null;
    const fileExt = file.name.split('.').pop();
    const filePath = `${organizerId}/${randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabaseService.storage.from(bucket).upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (uploadError) {
        console.error(`[Upload Helper] Supabase Upload Error (${bucket}):`, uploadError);
        throw new Error(`Storage upload failed for ${bucket}: ${uploadError.message}`);
    }
    const { data: urlData } = supabaseService.storage.from(bucket).getPublicUrl(filePath);
    if (!urlData?.publicUrl) {
        console.error(`[Upload Helper] Failed to get public URL for ${filePath}`);
        await supabaseService.storage.from(bucket).remove([filePath]);
        throw new Error(`Failed to retrieve public URL after upload for ${bucket}.`);
    }
    console.log(`[Upload Helper] File uploaded to ${bucket}: ${urlData.publicUrl}`);
    return urlData.publicUrl;
}


// --- Server Action ---
export async function createEvent(
    previousState: CreateEventState,
    formData: FormData // Action receives FormData directly
): Promise<CreateEventState> {

    // --- Authentication ---
    const supabaseActionClient = createServerActionClient();
    const supabaseService = createServiceRoleClient();
    let user;
    try {
        const { data: { user: authUser }, error: authError } = await supabaseActionClient.auth.getUser();
        if (authError || !authUser) throw new Error(authError?.message || 'Authentication required.');
        user = authUser;
        const { data: organizerData, error: organizerError } = await supabaseService.from('organizers').select('id').eq('id', user.id).maybeSingle();
        if (organizerError) throw new Error('Failed to verify organizer status.');
        if (!organizerData) throw new Error('You are not authorized to create events.');
        console.log(`[Create Event Action] User ${user.id} verified as organizer.`);
    } catch (e: any) {
         console.error("[Create Event Action] Error during auth/authz:", e.message);
         if (e.message?.includes('cookies() should be awaited')) return { error: 'Server error: Could not access session data.' };
         return { error: e.message || 'An authentication error occurred.' };
    }

    // --- Data Extraction & Validation ---
    // IMPORTANT: Read directly from formData passed to the action
    const rawData: { [key: string]: any } = {};
     formData.forEach((value, key) => {
         // Don't stringify files
         rawData[key] = value instanceof File ? value : String(value);
     });
    console.log("[Create Event Action] Raw form data received:", rawData);

    const validatedFields = eventSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("[Create Event Action] Validation failed:", validatedFields.error.flatten());
        return {
            error: 'Validation failed. Please check the marked fields.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    console.log("[Create Event Action] Validation successful.");
    const data = validatedFields.data;

    // --- File Uploads & DB Insert ---
    let bannerImageUrl: string | null = null;
    let qrCodeUrl: string | null = null;

    try {
        console.log("[Create Event Action] Uploading banner image...");
        // Use the File object directly from validated data
        bannerImageUrl = await uploadFile(supabaseService, data.banner, 'eventbanners', user.id);

        if (data.hasRegistrationFee && data.qrCode && data.qrCode.size > 0) {
            console.log("[Create Event Action] Uploading QR code image...");
            qrCodeUrl = await uploadFile(supabaseService, data.qrCode, 'payment_qrcodes', user.id);
            if (!qrCodeUrl && data.qrCode.size > 0) {
                 console.warn("[Create Event Action] QR Code upload failed but proceeding.");
            }
        }

        // Prepare data for DB
        const supabaseData = {
            organizer_id: user.id,
            name: data.title,
            description: data.description,
            banner_image: bannerImageUrl,
            event_type: data.eventType,
            location: data.location,
            start_date: new Date(data.eventStart).toISOString(),
            end_date: new Date(data.eventEnd).toISOString(),
            registration_start_date: new Date(data.registrationStart).toISOString(),
            registration_end_date: new Date(data.registrationEnd).toISOString(),
            results_announcement_date: new Date(data.resultsDate).toISOString(), 
            registration_fee: data.hasRegistrationFee ? data.feeAmount : 0,
            upi_id: data.hasRegistrationFee ? data.upiId : null,
            qr_code_url: qrCodeUrl,
            requirements: data.requirements,
            min_team_size: data.minTeamSize,
            max_team_size: data.maxTeamSize,
            rules: data.rules,
            prize_money: data.prizes,
            is_published: false,
        };

        console.log("[Create Event Action] Inserting data into Supabase:", supabaseData);
        const { error: insertError } = await supabaseActionClient
            .from('events')
            .insert(supabaseData);

        if (insertError) { throw insertError; }

        console.log("[Create Event Action] Event created successfully.");

    } catch (error: any) {
        console.error("[Create Event Action] Error during upload or DB insert:", error);
        console.log("[Create Event Action] Attempting cleanup...");
         // --- Cleanup Logic ---
         const cleanupFile = async (url: string | null, bucket: string) => { /* ... */ };
         await cleanupFile(bannerImageUrl, 'eventbanners');
         await cleanupFile(qrCodeUrl, 'payment_qrcodes');
         // --- End Cleanup ---
        if (error.code) { return { error: `Failed to create event: ${error.message} (Code: ${error.code})` }; }
        return { error: error.message || 'An unexpected error occurred.' };
    }

    // --- Redirect on Success ---
    redirect('/organizer/dashboard');
}