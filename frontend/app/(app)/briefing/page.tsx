'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authenticatedFetch } from '@/lib/api';

interface Briefing {
    event: {
        summary: string;
        start: string;
        location?: string;
        description?: string;
    };
    briefing: string;
    past_visits_count: number;
    last_visit_date?: string;
}

interface BriefingResponse {
    summary: string;
    next_event?: {
        summary: string;
        start: string;
        location?: string;
        time_until: string;
    };
    briefings: Briefing[];
    recommendations: string[];
}

export default function BriefingPage() {
    const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBriefing();
    }, []);

    const loadBriefing = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authenticatedFetch('/api/calendar/proactive-briefing');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setBriefing(data);
        } catch (err: any) {
            console.error('Error loading briefing:', err);
            setError(err.message || 'Failed to load briefing');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        if (isToday) return 'Today';
        if (isTomorrow) return 'Tomorrow';
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '1100px', animation: 'fadeIn 0.8s ease-out' }}>
                <h1>AI Proactive Briefing</h1>
                <p style={{ opacity: 0.6, marginBottom: '3rem', fontSize: '1.1rem' }}>
                    Loading your personalized tactical briefing...
                </p>
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                    <p>Analyzing your calendar and visit history...</p>
                </div>
            </div>
        );
    }

    if (error || !briefing) {
        return (
            <div style={{ maxWidth: '1100px', animation: 'fadeIn 0.8s ease-out' }}>
                <h1>AI Proactive Briefing</h1>
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <p>{error || 'Unable to load briefing'}</p>
                    <button onClick={loadBriefing} style={{ marginTop: '1.5rem' }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1100px', animation: 'fadeIn 0.8s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>AI Proactive Briefing</h1>
                    <p style={{ opacity: 0.6, fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        {briefing.summary}
                    </p>
                </div>
                <button onClick={loadBriefing} style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)'
                }}>
                    🔄 Refresh
                </button>
            </div>

            {/* Next Event Highlight */}
            {briefing.next_event && (
                <div className="card" style={{
                    animation: 'slideUp 0.6s ease-out both',
                    animationDelay: '0.1s',
                    background: 'linear-gradient(135deg, rgba(229, 185, 196, 0.1) 0%, rgba(192, 132, 252, 0.05) 100%)',
                    borderLeft: '5px solid var(--primary)',
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{
                            padding: '2px 8px',
                            background: 'var(--primary)',
                            color: '#000',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: '900'
                        }}>NEXT UP</span>
                        <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                            {formatDate(briefing.next_event.start)} at {formatTime(briefing.next_event.start)}
                        </span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                        {briefing.next_event.summary}
                    </h2>
                    {briefing.next_event.location && (
                        <p style={{ opacity: 0.7, fontSize: '0.95rem' }}>
                            📍 {briefing.next_event.location}
                        </p>
                    )}
                </div>
            )}

            {/* Individual Event Briefings */}
            {briefing.briefings.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                        Tactical Briefings
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {briefing.briefings.map((item, index) => (
                            <div
                                key={index}
                                className="card"
                                style={{
                                    animation: 'slideUp 0.6s ease-out both',
                                    animationDelay: `${0.2 + index * 0.1}s`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                            {item.event.summary}
                                        </h4>
                                        <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>
                                            {formatDate(item.event.start)} at {formatTime(item.event.start)}
                                            {item.event.location && ` • ${item.event.location}`}
                                        </p>
                                    </div>
                                    {item.past_visits_count > 0 && (
                                        <span style={{
                                            padding: '0.35rem 0.75rem',
                                            background: 'rgba(229, 185, 196, 0.15)',
                                            color: 'var(--primary)',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            border: '1px solid rgba(229, 185, 196, 0.2)',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.past_visits_count} PAST {item.past_visits_count === 1 ? 'VISIT' : 'VISITS'}
                                        </span>
                                    )}
                                </div>

                                <div style={{
                                    padding: '1.25rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    borderLeft: '3px solid var(--primary)'
                                }}>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', opacity: 0.9 }}>
                                        {item.briefing}
                                    </p>
                                </div>

                                {item.last_visit_date && (
                                    <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.5 }}>
                                        Last visit: {new Date(item.last_visit_date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {briefing.recommendations.length > 0 && (
                <div className="card" style={{
                    animation: 'slideUp 0.6s ease-out both',
                    animationDelay: '0.5s',
                    background: 'rgba(192, 132, 252, 0.05)',
                    border: '1px solid rgba(192, 132, 252, 0.2)'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--accent)' }}>
                        💡 Recommended Actions
                    </h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {briefing.recommendations.map((rec, index) => (
                            <li key={index} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem',
                                fontSize: '0.95rem',
                                opacity: 0.9
                            }}>
                                <span style={{
                                    marginTop: '0.2rem',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--accent)',
                                    boxShadow: '0 0 8px var(--accent)',
                                    flexShrink: 0
                                }} />
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Empty State */}
            {briefing.briefings.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>No Upcoming Visits</h3>
                    <p style={{ opacity: 0.6 }}>
                        Connect your calendar to get AI-powered briefings before your store visits.
                    </p>
                    <a href="/integrations" style={{
                        display: 'inline-block',
                        marginTop: '1.5rem',
                        padding: '0.875rem 1.75rem',
                        background: 'var(--primary)',
                        color: '#000',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: '700'
                    }}>
                        Connect Calendar
                    </a>
                </div>
            )}
        </div>
    );
}
