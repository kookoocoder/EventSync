// EventSync/app/api/upload-avatar/route.ts (Updated to delete old avatar)

import { NextResponse, type NextRequest } from 'next/server';
import { createServerActionClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;
    const nameFromForm = formData.get('name') as string | null; // Get name from form data

    // --- Authentication ---
    const supabaseUserClient = createServerActionClient();
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
        console.error("API Route: Auth Error:", authError?.message || "User not found");
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log(`API Route: User authenticated: ${user.id}`);

    // --- Service Client ---
    const supabaseService = createServiceRoleClient(); // Use for RLS bypass
    const bucketName = 'avatars';
    let oldFilePath: string | null = null; // Variable to store the old file path for deletion

    try {
        // --- Fetch existing avatar_url BEFORE upload ---
        console.log(`API Route: Fetching current participant data for ${user.id}`);
        const { data: currentParticipant, error: fetchError } = await supabaseService
            .from('participants')
            .select('avatar_url') // Select only the avatar URL
            .eq('id', user.id)
            .maybeSingle();

        if (fetchError) {
            console.error("API Route: Error fetching current participant data:", fetchError);
            // Decide if this is fatal. Maybe allow upload even if we can't fetch old URL? For now, let's error.
            throw new Error(`Failed to fetch current profile data: ${fetchError.message}`);
        }

        if (currentParticipant?.avatar_url) {
            // Extract the file path from the full public URL
            try {
                 // Construct the expected base URL part from your Supabase URL env var
                 const storageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/`;
                 if (currentParticipant.avatar_url.startsWith(storageBaseUrl)) {
                    // Extract the path relative to the bucket
                    oldFilePath = decodeURIComponent(currentParticipant.avatar_url.substring(storageBaseUrl.length));
                    console.log(`API Route: Determined old file path: ${oldFilePath}`);
                 } else {
                     console.warn(`API Route: Old avatar URL format unexpected: ${currentParticipant.avatar_url}`);
                     oldFilePath = null; // Cannot reliably determine path
                 }

            } catch(e) {
                 console.error("API Route: Error parsing old avatar URL:", e);
                 oldFilePath = null; // Safely ignore if parsing fails
            }
        }

        // Determine the final name to update (use form value if provided, else keep existing)
        const finalNameToUpdate = nameFromForm ?? user.user_metadata?.name; // Fallback to metadata name if needed

        let newAvatarUrl: string | null = currentParticipant?.avatar_url || null; // Default to old URL
        let fileUploaded = false;

        // --- File Upload (if file exists) ---
        if (file) {
            console.log("API Route: File provided, starting validation and upload.");
            // File Validation
            const maxSizeMB = 5;
            if (file.size > maxSizeMB * 1024 * 1024) throw new Error(`File size exceeds ${maxSizeMB}MB limit.`);
            const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) throw new Error('Invalid file type.');

            // Upload Logic
            const fileExt = file.name.split('.').pop();
            const newFilePath = `public/${user.id}/avatar-${Date.now()}.${fileExt}`;

            console.log(`API Route: Uploading for user ${user.id} to ${newFilePath}`);
            const { error: uploadError } = await supabaseService.storage
                .from(bucketName)
                .upload(newFilePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) {
                console.error("API Route: Supabase Upload Error:", uploadError);
                throw new Error(`Storage upload failed: ${uploadError.message}`);
            }

            // Get Public URL for the *new* file
            const { data: urlData } = supabaseService.storage
                .from(bucketName)
                .getPublicUrl(newFilePath);

            if (!urlData?.publicUrl) {
                console.error("API Route: Failed to get public URL for new file:", newFilePath);
                // Attempt cleanup of the file we just uploaded if URL fetch fails
                await supabaseService.storage.from(bucketName).remove([newFilePath]);
                throw new Error('Failed to retrieve public URL after upload.');
            }
            newAvatarUrl = urlData.publicUrl; // Set the NEW url
            fileUploaded = true;
            console.log(`API Route: New Public URL retrieved: ${newAvatarUrl}`);
        } else {
            console.log("API Route: No new avatar file provided.");
        }


        // --- Update 'participants' Table (Name and/or Avatar URL) ---
        // Only update if name changed or a new file was uploaded
        if (finalNameToUpdate !== user.user_metadata?.name || fileUploaded) {
            const updatePayload: { name: string; avatar_url?: string | null; updated_at: string } = {
                name: finalNameToUpdate, // Always update name if called (or keep existing if nameFromForm is null)
                updated_at: new Date().toISOString()
            };
            if (fileUploaded) {
                updatePayload.avatar_url = newAvatarUrl; // Update avatar if new one uploaded
            } else {
                // If no new file, ensure we don't accidentally clear the avatar url if name is updated
                // We already fetched the current one into newAvatarUrl variable if needed.
                // Alternatively, only include avatar_url in payload if fileUploaded is true.
                 updatePayload.avatar_url = newAvatarUrl; // Assign current or new URL
            }


            console.log(`API Route: Updating 'participants' table for id ${user.id} with payload:`, updatePayload);
            const { error: dbUpdateError } = await supabaseService
                .from('participants')
                .update(updatePayload)
                .eq('id', user.id);

            if (dbUpdateError) {
                console.error("API Route: Database Update Error:", dbUpdateError);
                // If DB update fails AFTER a successful upload, attempt to delete the NEW file
                if (fileUploaded && newAvatarUrl) {
                    const pathToDelete = decodeURIComponent(newAvatarUrl.substring(newAvatarUrl.indexOf(bucketName+'/') + bucketName.length + 1));
                    console.log(`API Route: DB update failed, attempting cleanup of new file: ${pathToDelete}`);
                    await supabaseService.storage.from(bucketName).remove([pathToDelete]);
                }
                throw new Error(`Failed to update participant profile: ${dbUpdateError.message}`);
            }
            console.log(`API Route: 'participants' table updated successfully for user ${user.id}.`);

            // --- Delete Old Avatar (if new one uploaded successfully AND old one existed) ---
            if (fileUploaded && oldFilePath && oldFilePath !== newAvatarUrl) { // Ensure we don't delete the one we just uploaded if paths matched somehow
                 console.log(`API Route: Deleting old avatar file: ${oldFilePath}`);
                const { error: deleteError } = await supabaseService.storage
                    .from(bucketName)
                    .remove([oldFilePath]); // remove expects an array of paths

                if (deleteError) {
                    // Log this error but don't fail the request, main update succeeded
                    console.error("API Route: Failed to delete old avatar:", deleteError);
                } else {
                    console.log("API Route: Old avatar deleted successfully.");
                }
            }

        } else {
             console.log("API Route: No changes detected in name or avatar file.");
        }


        // --- Success Response ---
        return NextResponse.json({
            message: 'Profile updated successfully!',
            // Send back the potentially updated avatar URL
            avatarUrl: newAvatarUrl ?? user.user_metadata?.avatar_url, // Use new or existing
        });

    } catch (error: any) {
        console.error("API Route: Catch Block Error:", error.message || error);
        return NextResponse.json({ error: error.message || 'Failed to update profile.' }, { status: 500 });
    }
}