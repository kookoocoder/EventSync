/**
 * Debug utility for Supabase authentication issues
 */

export async function debugSupabaseAuth() {
  if (typeof window === 'undefined') {
    console.log('Not in browser environment');
    return;
  }
  
  console.log('=== SUPABASE AUTH DEBUG ===');
  
  // Test browser functionality
  console.log('Navigator:', {
    userAgent: navigator.userAgent,
    cookieEnabled: navigator.cookieEnabled,
  });
  
  // Check localStorage availability and permissions
  try {
    const testKey = 'supabase-auth-debug-test';
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    const isWritable = testValue === 'test';
    console.log('LocalStorage is available and writable:', isWritable);
    
    if (!isWritable) {
      console.error('LocalStorage test failed! Session storage may not work.');
    }
    
    // Check storage size limits
    try {
      // Try to determine how much storage is being used
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length;
      }
      console.log(`LocalStorage usage: ~${(totalSize / 1024).toFixed(2)} KB`);
    } catch (e) {
      console.error('Error checking localStorage size:', e);
    }
  } catch (error) {
    console.error('LocalStorage is not available:', error);
  }
  
  // Check for auth token in storage
  try {
    const tokens = Object.keys(localStorage).filter(key => 
      key.includes('supabase.auth') || 
      key.includes('sb-')
    );
    
    console.log('Auth tokens in localStorage:', tokens);
    
    if (tokens.length === 0) {
      console.error('No auth tokens found in localStorage! This is likely the cause of session issues.');
    }
    
    for (const key of tokens) {
      const value = localStorage.getItem(key);
      try {
        if (value) {
          // Just log existence and key name, not the actual token value for security
          console.log(`Token ${key} exists:`, !!value);
          
          // If it's JSON, check its structure (redact sensitive info)
          if (value.startsWith('{')) {
            const parsed = JSON.parse(value);
            console.log(`Token ${key} structure:`, {
              hasExpiresAt: !!parsed.expires_at,
              expiryTime: parsed.expires_at ? new Date(parsed.expires_at * 1000).toISOString() : 'none',
              hasRefreshToken: !!parsed.refresh_token,
              hasAccessToken: !!parsed.access_token,
              expiresIn: parsed.expires_in || 'not set',
            });
            
            // Check if token is expired
            if (parsed.expires_at) {
              const now = Math.floor(Date.now() / 1000);
              const isExpired = now > parsed.expires_at;
              console.log(`Token is ${isExpired ? 'EXPIRED' : 'valid'} (${now} vs ${parsed.expires_at})`);
            }
          }
        }
      } catch (err) {
        console.log(`Error parsing token ${key}:`, err);
      }
    }
  } catch (error) {
    console.error('Error checking auth tokens:', error);
  }
  
  // Check cookies
  try {
    console.log('Cookies:', document.cookie ? 'Present' : 'None');
    
    const cookies = document.cookie.split(';').map(c => c.trim());
    const authCookies = cookies.filter(c => 
      c.startsWith('sb-') || 
      c.includes('supabase')
    );
    console.log('Auth cookies:', authCookies.length ? authCookies.map(c => c.split('=')[0]) : 'None');
  } catch (error) {
    console.error('Error checking cookies:', error);
  }
  
  // Check for hash parameters that might contain session info
  try {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      console.log('URL hash contains parameters that might be auth tokens');
      const hasAccessToken = hash.includes('access_token=');
      const hasRefreshToken = hash.includes('refresh_token=');
      console.log('Hash contains access_token:', hasAccessToken);
      console.log('Hash contains refresh_token:', hasRefreshToken);
      
      // Check if URL is malformed
      if (hasAccessToken && hasRefreshToken) {
        console.log('Hash appears to contain valid auth tokens');
      } else {
        console.error('Hash may be malformed - missing essential tokens');
      }
      
      // Log URL structure (sanitized)
      const hashParts = hash.substring(1).split('&');
      console.log('Hash structure:', hashParts.map(part => part.split('=')[0]));
    } else {
      console.log('No auth tokens in URL hash');
    }
  } catch (error) {
    console.error('Error checking URL hash:', error);
  }
  
  // Try to make a test API call through Supabase
  try {
    // Try to access the Supabase instance if available
    const supabase = (window as any).supabase;
    if (supabase) {
      console.log('Testing Supabase session...');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase getSession failed:', error.message);
      } else {
        console.log('Supabase getSession result:', data.session ? 'Session found' : 'No session');
      }
    } else {
      console.log('Supabase global instance not found');
    }
  } catch (e) {
    console.error('Error testing Supabase session:', e);
  }
  
  console.log('=== END DEBUG ===');
} 