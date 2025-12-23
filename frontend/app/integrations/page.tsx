'use client';

import React, { useState } from 'react';

export default function IntegrationsPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const connectCalendar = (provider: string) => {
        setLoading(provider);
        // In a real app, this would fetch the URL from the backend and redirect
        // const response = await fetch(`/api/calendar/auth-url/${provider}`);
        // const { url } = await response.json();
        // window.location.href = url;

        setTimeout(() => {
            alert(`Connecting to ${provider}... (In a production app, you'd be redirected to ${provider}'s OAuth login)`);
            setLoading(null);
        }, 1000);
    };

    return (
        <div>
            <h1>Integrations</h1>
            <p style={{ opacity: 0.6, marginBottom: '2rem' }}>
                Connect your tools to enable AI-powered proactive briefing and automated task syncing.
            </p>

            <div className="grid">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3>Google Calendar</h3>
                            <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Sync store visits and training sessions.
                            </p>
                        </div>
                        <div style={{ fontSize: '2rem' }}>📅</div>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                        <button
                            onClick={() => connectCalendar('google')}
                            disabled={loading === 'google'}
                            style={{ width: '100%', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                        >
                            {loading === 'google' ? 'Connecting...' : 'Connect Google Calendar'}
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3>Outlook Calendar</h3>
                            <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Microsoft 365 integration for enterprise AEs.
                            </p>
                        </div>
                        <div style={{ fontSize: '2rem' }}>📧</div>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                        <button
                            onClick={() => connectCalendar('outlook')}
                            disabled={loading === 'outlook'}
                            style={{ width: '100%', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                        >
                            {loading === 'outlook' ? 'Connecting...' : 'Connect Outlook Calendar'}
                        </button>
                    </div>
                </div>

                <div className="card glass-morphism" style={{ opacity: 0.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3>Salesforce</h3>
                            <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Coming Soon for Enterprise customers.
                            </p>
                        </div>
                        <div style={{ fontSize: '2rem' }}>☁️</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3>Why connect your calendar?</h3>
                <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <li style={{ display: 'flex', gap: '0.75rem' }}>
                        <span>✨</span>
                        <div>
                            <strong>Proactive AI Briefings</strong>
                            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Receive a summary of POS data and past visit notes 15 minutes before your meeting.</p>
                        </div>
                    </li>
                    <li style={{ display: 'flex', gap: '0.75rem' }}>
                        <span>✨</span>
                        <div>
                            <strong>Auto-Log Store Visits</strong>
                            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>The AI matches your audio recordings to your scheduled appointments automatically.</p>
                        </div>
                    </li>
                    <li style={{ display: 'flex', gap: '0.75rem' }}>
                        <span>✨</span>
                        <div>
                            <strong>Smart Task Sync</strong>
                            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Follow-up tasks identified by AI are added directly to your calendar as time blocks.</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}
