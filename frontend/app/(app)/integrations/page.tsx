'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { API_URL } from '@/lib/config';
import { authenticatedFetch } from '@/lib/api';

interface IntegrationStatus {
    provider: string;
    connected: boolean;
    connected_at?: string;
    last_synced_at?: string;
}

export default function IntegrationsPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [statuses, setStatuses] = useState<IntegrationStatus[]>([
        { provider: 'google', connected: false },
        { provider: 'outlook', connected: false }
    ]);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUserAndStatuses();
    }, []);

    const loadUserAndStatuses = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            setUserId(user.id);
            await fetchIntegrationStatuses(user.id);
        }
    };

    const fetchIntegrationStatuses = async (uid: string) => {
        try {
            const response = await authenticatedFetch(`/api/calendar/status?user_id=${uid}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setStatuses(data);
            }
        } catch (error) {
            console.error('Error fetching integration statuses:', error);
        }
    };

    const connectCalendar = async (provider: string) => {
        if (!userId) {
            alert('Please log in to connect your calendar');
            return;
        }

        setLoading(provider);

        try {
            const response = await authenticatedFetch(`/api/calendar/auth-url/${provider}?user_id=${userId}`);

            if (!response.ok) {
                throw new Error(`Failed to get OAuth URL: ${response.statusText}`);
            }

            const data = await response.json();
            window.location.href = data.url;
        } catch (error) {
            console.error('Error connecting calendar:', error);
            alert(`Failed to connect ${provider}. Please try again.`);
            setLoading(null);
        }
    };

    const disconnectCalendar = async (provider: string) => {
        if (!userId) return;

        if (!confirm(`Disconnect ${provider === 'google' ? 'Google' : 'Outlook'} Calendar?`)) {
            return;
        }

        setLoading(provider);

        try {
            const response = await authenticatedFetch(
                `/api/calendar/disconnect/${provider}?user_id=${userId}`,
                { method: 'DELETE' }
            );

            if (!response.ok) {
                throw new Error('Failed to disconnect calendar');
            }

            await fetchIntegrationStatuses(userId);
        } catch (error) {
            console.error('Error disconnecting calendar:', error);
            alert(`Failed to disconnect ${provider}. Please try again.`);
        } finally {
            setLoading(null);
        }
    };

    const getStatus = (provider: string): IntegrationStatus => {
        return statuses.find(s => s.provider === provider) || { provider, connected: false };
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="page-container">
            <h1>Ecosystem Integrations</h1>
            <p className="page-subtitle" style={{ marginBottom: '3rem' }}>
                Seamlessly connect your business tools to fuel the AI Proactive Briefing engine.
            </p>

            <div className="grid">
                <div className="card" style={{ animation: 'slideUp 0.6s ease-out both', animationDelay: '0.1s' }}>
                    <div className="integration-card-header">
                        <div>
                            <h3>Google Calendar</h3>
                            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Sync store visits and training sessions.
                            </p>
                            {getStatus('google').connected && (
                                <p className="integration-status-connected">
                                    ✓ Connected {getStatus('google').connected_at && `on ${formatDate(getStatus('google').connected_at)}`}
                                </p>
                            )}
                        </div>
                        <div className="integration-card-icon">📅</div>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        {getStatus('google').connected ? (
                            <button
                                onClick={() => disconnectCalendar('google')}
                                disabled={loading === 'google'}
                                className="btn-disconnect"
                            >
                                {loading === 'google' ? 'Disconnecting...' : 'Disconnect'}
                            </button>
                        ) : (
                            <button
                                onClick={() => connectCalendar('google')}
                                disabled={loading === 'google'}
                                className="btn-connect"
                            >
                                {loading === 'google' ? 'Initializing OAuth...' : 'Connect Workspace Account'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="card" style={{ animation: 'slideUp 0.6s ease-out both', animationDelay: '0.2s' }}>
                    <div className="integration-card-header">
                        <div>
                            <h3>Outlook Calendar</h3>
                            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Microsoft 365 enterprise AE sync.
                            </p>
                            {getStatus('outlook').connected && (
                                <p className="integration-status-connected">
                                    ✓ Connected {getStatus('outlook').connected_at && `on ${formatDate(getStatus('outlook').connected_at)}`}
                                </p>
                            )}
                        </div>
                        <div className="integration-card-icon">📧</div>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        {getStatus('outlook').connected ? (
                            <button
                                onClick={() => disconnectCalendar('outlook')}
                                disabled={loading === 'outlook'}
                                className="btn-disconnect"
                            >
                                {loading === 'outlook' ? 'Disconnecting...' : 'Disconnect'}
                            </button>
                        ) : (
                            <button
                                onClick={() => connectCalendar('outlook')}
                                disabled={loading === 'outlook'}
                                className="btn-connect"
                            >
                                {loading === 'outlook' ? 'Initializing OAuth...' : 'Connect M365 Account'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="card glass-morphism integration-card--coming-soon" style={{ animation: 'slideUp 0.6s ease-out both', animationDelay: '0.3s' }}>
                    <div className="integration-card-header">
                        <div>
                            <h3>Salesforce CRM</h3>
                            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Coming Soon: Direct Inventory Sync.
                            </p>
                        </div>
                        <div className="integration-card-icon--disabled">☁️</div>
                    </div>
                </div>
            </div>

            <div className="card glass-morphism intelligence-card" style={{ animation: 'slideUp 0.6s ease-out both', animationDelay: '0.4s' }}>
                <h3 className="intelligence-card-title">The Intelligence Edge</h3>
                <div className="intelligence-features-grid">
                    {[
                        {
                            title: "Proactive AI Briefings",
                            desc: "Receive a tactical summary of POS data and past visit notes 15m before your meetings.",
                            icon: "✨"
                        },
                        {
                            title: "Auto-Log Store Visits",
                            desc: "The AI matches your field audio to your scheduled appointments automatically.",
                            icon: "🛠️"
                        },
                        {
                            title: "Smart Task Time-Blocking",
                            desc: "Follow-up tasks identified by AI are added directly to your calendar as reserved blocks.",
                            icon: "🗓️"
                        }
                    ].map((item, i) => (
                        <div key={i}>
                            <div className="intelligence-feature-header">
                                <span className="intelligence-feature-icon">{item.icon}</span>
                                <strong className="intelligence-feature-title">{item.title}</strong>
                            </div>
                            <p className="intelligence-feature-desc">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
