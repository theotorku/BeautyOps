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
        <div style={{ maxWidth: '1100px', animation: 'fadeIn 0.8s ease-out' }}>
            <h1>Ecosystem Integrations</h1>
            <p style={{ opacity: 0.6, marginBottom: '3rem', fontSize: '1.1rem' }}>
                Seamlessly connect your business tools to fuel the AI Proactive Briefing engine.
            </p>

            <div className="grid">
                <div className="card" style={{ animation: 'slideUp 0.6s ease-out both', animationDelay: '0.1s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem' }}>Google Calendar</h3>
                            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Sync store visits and training sessions.
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>📅</div>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <button
                            onClick={() => connectCalendar('google')}
                            disabled={loading === 'google'}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                fontWeight: '700'
                            }}
                        >
                            {loading === 'google' ? 'Initializing OAuth...' : 'Connect Workspace Account'}
                        </button>
                    </div>
                </div>

                <div className="card" style={{ animation: 'slideUp 0.6s ease-out both', animationDelay: '0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem' }}>Outlook Calendar</h3>
                            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Microsoft 365 enterprise AE sync.
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>📧</div>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <button
                            onClick={() => connectCalendar('outlook')}
                            disabled={loading === 'outlook'}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                fontWeight: '700'
                            }}
                        >
                            {loading === 'outlook' ? 'Initializing OAuth...' : 'Connect M365 Account'}
                        </button>
                    </div>
                </div>

                <div className="card glass-morphism" style={{ opacity: 0.4, animation: 'slideUp 0.6s ease-out both', animationDelay: '0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem' }}>Salesforce CRM</h3>
                            <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Coming Soon: Direct Inventory Sync.
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem', filter: 'grayscale(1)' }}>☁️</div>
                    </div>
                </div>
            </div>

            <div className="card glass-morphism" style={{ marginTop: '3rem', animation: 'slideUp 0.6s ease-out both', animationDelay: '0.4s', borderLeft: '4px solid var(--accent)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>The Intelligence Edge</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{item.icon}</span>
                                <strong style={{ fontSize: '1.1rem' }}>{item.title}</strong>
                            </div>
                            <p style={{ opacity: 0.6, fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
