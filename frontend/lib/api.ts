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

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        }
    });
}
