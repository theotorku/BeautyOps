'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { API_URL } from '@/lib/config';
import { authenticatedFetch } from '@/lib/api';

export default function CalendarCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Connecting your calendar...');

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const provider = params.provider as string;

        if (error) {
            setStatus('error');
            setMessage(`Authorization failed: ${error}`);
            setTimeout(() => router.push('/integrations'), 3000);
            return;
        }

        if (!code || !state) {
            setStatus('error');
            setMessage('Missing authorization code or state parameter');
            setTimeout(() => router.push('/integrations'), 3000);
            return;
        }

        try {
            const response = await authenticatedFetch(
                `/api/calendar/callback/${provider}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to connect calendar');
            }

            const data = await response.json();

            setStatus('success');
            setMessage(`${data.message || 'Calendar connected successfully!'}`);

            setTimeout(() => router.push('/integrations'), 2000);

        } catch (error: any) {
            console.error('OAuth callback error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to connect calendar. Please try again.');
            setTimeout(() => router.push('/integrations'), 3000);
        }
    };

    return (
        <div className="callback-container">
            <div className="card callback-card">
                {status === 'loading' && (
                    <>
                        <div className="callback-icon callback-icon--pulse">
                            📅
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>Connecting Calendar...</h2>
                        <p className="callback-message">Securely exchanging OAuth tokens</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="callback-icon callback-icon--scale">
                            ✅
                        </div>
                        <h2 className="callback-title--success">Success!</h2>
                        <p className="callback-message--success">{message}</p>
                        <p className="callback-redirect-note">
                            Redirecting you back to integrations...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="callback-icon">
                            ❌
                        </div>
                        <h2 className="callback-title--error">Connection Failed</h2>
                        <p className="callback-message--success">{message}</p>
                        <p className="callback-redirect-note">
                            Redirecting you back to try again...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
