import { createClient } from '@supabase/supabase-js'

// Create a single instance for the browser
let browserClient: ReturnType<typeof createClient> | null = null;

// Check if window is defined (browser environment)
const isBrowser = () => typeof window !== 'undefined';

// Test localStorage availability and permissions
const testLocalStorage = () => {
  if (!isBrowser()) return false;
  
  try {
    const testKey = 'supabase_storage_test';
    localStorage.setItem(testKey, 'test');
    const result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return result === 'test';
  } catch (e) {
    console.error('[Storage] localStorage test failed:', e);
    return false;
  }
};

// Create a robust storage implementation
const createLocalStorageAdapter = () => {
  // Check localStorage availability once when adapter is created
  const isLocalStorageAvailable = testLocalStorage();
  console.log('[Storage] localStorage is available:', isLocalStorageAvailable);
  
  // Use in-memory fallback if localStorage is not available
  const memoryStorage: Record<string, string> = {};
  
  return {
    getItem: (key: string) => {
      if (!isBrowser()) {
        console.log(`[Storage] Not in browser, can't getItem: ${key}`);
        return null;
      }
      
      try {
        if (!isLocalStorageAvailable) {
          console.log(`[Storage] Using memory fallback to get: ${key}`);
          return memoryStorage[key] || null;
        }
        
        const item = window.localStorage.getItem(key);
        console.log(`[Storage] Getting localStorage item: ${key} - ${item ? 'Found' : 'Not found'}`);
        return item;
      } catch (error) {
        console.error(`[Storage] Error getting item ${key}:`, error);
        // Try memory fallback
        return memoryStorage[key] || null;
      }
    },
    
    setItem: (key: string, value: string) => {
      if (!isBrowser()) {
        console.log(`[Storage] Not in browser, can't setItem: ${key}`);
        return;
      }
      
      // Always store in memory fallback
      memoryStorage[key] = value;
      
      try {
        if (!isLocalStorageAvailable) {
          console.log(`[Storage] Using memory fallback to set: ${key}`);
          return;
        }
        
        console.log(`[Storage] Setting localStorage item: ${key}`);
        window.localStorage.setItem(key, value);
        // Verify it was set correctly
        const stored = window.localStorage.getItem(key);
        if (stored !== value) {
          console.warn(`[Storage] Verification failed for ${key} - falling back to memory storage`);
        }
      } catch (error) {
        console.error(`[Storage] Error setting item ${key}:`, error);
      }
    },
    
    removeItem: (key: string) => {
      if (!isBrowser()) {
        console.log(`[Storage] Not in browser, can't removeItem: ${key}`);
        return;
      }
      
      // Always remove from memory fallback
      delete memoryStorage[key];
      
      try {
        if (!isLocalStorageAvailable) {
          console.log(`[Storage] Using memory fallback to remove: ${key}`);
          return;
        }
        
        console.log(`[Storage] Removing localStorage item: ${key}`);
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error(`[Storage] Error removing item ${key}:`, error);
      }
    },
  };
};

export const getBrowserClient = () => {
  // Return existing instance if already created
  if (browserClient) return browserClient;
  
  console.log("[BrowserClient] Creating new Supabase client");
  
  try {
    // Create a new client if one doesn't exist
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'supabase.auth.token',
          storage: createLocalStorageAdapter(),
          flowType: 'pkce', // Use PKCE flow for better security and compatibility
          debug: true, // Enable auth debugging
        },
        global: {
          headers: {
            'x-client-info': 'EventSync Web App',
          },
        },
      }
    );
    
    // Test auth setup if in browser
    if (isBrowser()) {
      console.log("[BrowserClient] Initialized Supabase client");
      
      // Check if we have a valid session in localStorage
      try {
        const sessionStr = window.localStorage.getItem('supabase.auth.token');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            console.log("[BrowserClient] Found existing session in localStorage");
            
            // Log expiration details and check if token is expired
            if (session.expires_at) {
              const now = Math.floor(Date.now() / 1000);
              const expiresAt = session.expires_at;
              const isExpired = now > expiresAt;
              console.log(`[BrowserClient] Session expires: ${new Date(expiresAt * 1000).toISOString()}`);
              console.log(`[BrowserClient] Session is ${isExpired ? 'EXPIRED' : 'valid'}`);
            } else {
              console.log("[BrowserClient] Session has no expiration information");
            }
          } catch (e) {
            console.error("[BrowserClient] Error parsing stored session:", e);
          }
        } else {
          console.log("[BrowserClient] No existing session in localStorage");
        }
      } catch (e) {
        console.error("[BrowserClient] Error checking localStorage:", e);
      }
      
      // Register auth state change listener for debugging
      browserClient.auth.onAuthStateChange((event, session) => {
        console.log(`[BrowserClient] Auth state changed: ${event}`, 
                   session ? `User: ${session.user.email}` : 'No session');
        
        // Force refresh localStorage on sign in
        if (event === 'SIGNED_IN' && session) {
          try {
            console.log('[BrowserClient] User signed in, verifying localStorage session');
            const storedSession = localStorage.getItem('supabase.auth.token');
            if (!storedSession) {
              console.warn('[BrowserClient] Session not found in localStorage after sign in, forcing save');
              const sessionData = {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                expires_at: session.expires_at,
                expires_in: session.expires_in
              };
              localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));
            }
          } catch (e) {
            console.error('[BrowserClient] Error verifying session after sign in:', e);
          }
        }
      });
    }
    
    return browserClient;
  } catch (error) {
    console.error("[BrowserClient] Error creating Supabase client:", error);
    // Create a minimal client in case of error
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
};

// Function to clear client for testing/logout cases
export const clearBrowserClient = () => {
  if (browserClient) {
    console.log("[BrowserClient] Clearing client instance");
    browserClient = null;
  }
};

// Helper to check if we're in a browser environment
export const isBrowserEnv = isBrowser;

// Export the browser client for debugging if in browser
if (isBrowser()) {
  try {
    (window as any).supabase = getBrowserClient();
    console.log('[BrowserClient] Exposed Supabase client globally for debugging');
  } catch (e) {
    console.error('[BrowserClient] Error exposing client globally:', e);
  }
} 