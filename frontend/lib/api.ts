import { createClient } from '@/lib/supabase/client';
import { API_URL } from './config';

/**
 * Make an authenticated fetch request to the backend API
 * Automatically includes Supabase JWT token in Authorization header
 */
export async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('No active session');
    }

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
    };

    // Only set Content-Type for non-FormData requests
    // FormData sets its own Content-Type with boundary
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Merge with any existing headers from options
    const existingHeaders = options.headers as Record<string, string> || {};

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...existingHeaders,
        }
    });
}
