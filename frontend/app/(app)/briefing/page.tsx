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
            <div className="page-container">
                <h1>AI Proactive Briefing</h1>
                <p className="page-subtitle" style={{ marginBottom: '3rem' }}>
                    Loading your personalized tactical briefing...
                </p>
                <div className="card briefing-empty-card">
                    <div className="briefing-empty-icon">🤖</div>
                    <p>Analyzing your calendar and visit history...</p>
                </div>
            </div>
        );
    }

    if (error || !briefing) {
        return (
            <div className="page-container">
                <h1>AI Proactive Briefing</h1>
                <div className="card briefing-empty-card">
                    <div className="briefing-empty-icon">⚠️</div>
                    <p>{error || 'Unable to load briefing'}</p>
                    <button onClick={loadBriefing} style={{ marginTop: '1.5rem' }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>AI Proactive Briefing</h1>
                    <p className="page-subtitle">
                        {briefing.summary}
                    </p>
                </div>
                <button onClick={loadBriefing} className="btn-ghost btn-sm">
                    🔄 Refresh
                </button>
            </div>

            {/* Next Event Highlight */}
            {briefing.next_event && (
                <div className="card briefing-next-event" style={{
                    animation: 'slideUp 0.6s ease-out both',
                    animationDelay: '0.1s'
                }}>
                    <div className="briefing-next-event-meta">
                        <span className="card-badge" style={{ background: 'var(--primary)', color: '#000', fontSize: '0.65rem' }}>NEXT UP</span>
                        <span className="briefing-next-event-time">
                            {formatDate(briefing.next_event.start)} at {formatTime(briefing.next_event.start)}
                        </span>
                    </div>
                    <h2 className="briefing-event-title">
                        {briefing.next_event.summary}
                    </h2>
                    {briefing.next_event.location && (
                        <p className="briefing-event-location">
                            📍 {briefing.next_event.location}
                        </p>
                    )}
                </div>
            )}

            {/* Individual Event Briefings */}
            {briefing.briefings.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 className="briefing-section-title">
                        Tactical Briefings
                    </h3>
                    <div className="briefing-list">
                        {briefing.briefings.map((item, index) => (
                            <div
                                key={index}
                                className="card"
                                style={{
                                    animation: 'slideUp 0.6s ease-out both',
                                    animationDelay: `${0.2 + index * 0.1}s`
                                }}
                            >
                                <div className="briefing-event-card-header">
                                    <div className="briefing-event-card-meta">
                                        <h4 className="briefing-event-card-name">
                                            {item.event.summary}
                                        </h4>
                                        <p className="briefing-event-card-time">
                                            {formatDate(item.event.start)} at {formatTime(item.event.start)}
                                            {item.event.location && ` • ${item.event.location}`}
                                        </p>
                                    </div>
                                    {item.past_visits_count > 0 && (
                                        <span className="card-badge">
                                            {item.past_visits_count} PAST {item.past_visits_count === 1 ? 'VISIT' : 'VISITS'}
                                        </span>
                                    )}
                                </div>

                                <div className="briefing-body-block">
                                    <p className="briefing-body-text">
                                        {item.briefing}
                                    </p>
                                </div>

                                {item.last_visit_date && (
                                    <p className="briefing-last-visit">
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
                <div className="card recommendations-card" style={{
                    animation: 'slideUp 0.6s ease-out both',
                    animationDelay: '0.5s'
                }}>
                    <h3 className="recommendations-title">
                        💡 Recommended Actions
                    </h3>
                    <ul className="recommendations-list">
                        {briefing.recommendations.map((rec, index) => (
                            <li key={index} className="recommendations-item">
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Empty State */}
            {briefing.briefings.length === 0 && (
                <div className="card briefing-empty-card">
                    <div className="briefing-empty-icon">📅</div>
                    <h3 style={{ marginBottom: '0.5rem' }}>No Upcoming Visits</h3>
                    <p style={{ opacity: 0.6 }}>
                        Connect your calendar to get AI-powered briefings before your store visits.
                    </p>
                    <a href="/integrations" className="briefing-empty-link">
                        Connect Calendar
                    </a>
                </div>
            )}
        </div>
    );
}
