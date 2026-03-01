'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/api';
import DigestSettings from '@/components/DigestSettings';
import FollowUpReminders from '@/components/FollowUpReminders';

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showDigest, setShowDigest] = useState(false);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      const response = await authenticatedFetch('/api/calendar/events');
      if (response.ok) {
        const events = await response.json();
        setUpcomingEvents(events.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) return `Today at ${timeStr}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${timeStr}`;
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
  };

  return (
    <div className="page-fade-in">
      <h1>Beauty Command Center</h1>
      <p className="page-subtitle">
        Welcome back, AE. Your AI-optimized priority list is ready.
      </p>

      <div className="grid">
        {/* Daily Priorities */}
        <div className="card card-animated">
          <div className="card-header">
            <h3 className="card-title">Daily Priorities</h3>
            <span className="card-badge">3 PENDING</span>
          </div>
          <ul className="task-list">
            {[
              "Follow up with Sephora Times Square",
              "Analyze last week's POS for Ulta Region 4",
              "Prepare training script for holiday launch"
            ].map((task, i) => (
              <li key={i}>
                <span className="dot-indicator" />
                {task}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="card card-animated">
          <h3 className="card-title">Quick Actions</h3>
          <div className="action-stack">
            <button onClick={() => router.push('/visits')}>
              <span style={{ fontSize: '1.2rem' }}>🎙️</span> Record Store Visit
            </button>
            <button className="btn-ghost" onClick={() => router.push('/pos')}>
              <span style={{ fontSize: '1.1rem' }}>📈</span> Upload POS Data
            </button>
            <button className="btn-accent" onClick={() => router.push('/integrations')}>
              <span style={{ fontSize: '1.2rem' }}>📸</span> Competitive Snapshot
            </button>
            <button className="btn-ghost" onClick={() => setShowDigest(true)}>
              <span style={{ fontSize: '1.1rem' }}>📧</span> Digest Settings
            </button>
          </div>
        </div>

        {/* Upcoming Calendar Events */}
        <div className="card card-animated">
          <div className="card-header" style={{ alignItems: 'center' }}>
            <h3 className="card-title">Upcoming Visits</h3>
            <button
              className="btn-ghost"
              onClick={() => router.push('/integrations')}
              style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
            >
              {upcomingEvents.length > 0 ? '📅' : '+ Connect'}
            </button>
          </div>

          {loadingEvents ? (
            <div className="events-loading">
              <p>Loading calendar events...</p>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <ul className="task-list" style={{ gap: '1rem' }}>
              {upcomingEvents.map((event) => (
                <li key={event.id} className="event-item" style={{ display: 'block' }}>
                  <div className="event-row">
                    <span className="event-icon">📅</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                        {event.summary}
                      </p>
                      <p className="event-time">{formatEventTime(event.start)}</p>
                      {event.location && (
                        <p className="event-location">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-inline">
              <span className="empty-inline-icon">📅</span>
              <p className="empty-inline-title">No upcoming events</p>
              <p className="empty-inline-desc">Connect your calendar to see visits here</p>
            </div>
          )}
        </div>

        {/* Performance Overview */}
        <div className="card card-animated stat-hero">
          <h3 className="stat-hero-label">Region Performance</h3>
          <p className="stat-hero-value">+12.4%</p>
          <div className="stat-hero-trend">
            <span className="trend-up">↗</span>
            <span>Sell-through lift vs. Last Month</span>
          </div>
        </div>

        {/* Proactive Briefing Widget */}
        <div className="card card-animated card-full glass-morphism" style={{ borderLeft: '5px solid var(--primary)' }}>
          <div className="briefing-header">
            <div>
              <div className="briefing-meta">
                <span className="badge-live">LIVE</span>
                <span className="badge-label">Upcoming Briefing (in 15m)</span>
              </div>
              <h2 className="briefing-title">Sephora Times Square - Holiday Refresh</h2>
            </div>
            <button onClick={() => router.push('/visits')} className="btn-sm">Open Strategic Brief</button>
          </div>
          <div className="briefing-grid">
            <div className="briefing-stat">
              <p className="briefing-stat-label">Last Visit Critical Issue</p>
              <p className="briefing-stat-value">🚨 Out of stock on Hydra-Silk Serum (Shelf Share -8%)</p>
            </div>
            <div className="briefing-stat">
              <p className="briefing-stat-label">POS Performance Highlight</p>
              <p className="briefing-stat-value">📈 +22% lift in &apos;Glow Kit&apos; sales vs. same period Y1</p>
            </div>
          </div>
        </div>

        {/* AI Follow-Up Reminders */}
        <FollowUpReminders />

        {/* AI Vision Insight Card */}
        <div className="card card-animated card-full card-vision glass-morphism">
          <div className="vision-layout">
            <div className="vision-icon">
              📸
              <div className="notification-dot" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 className="vision-title">AI Vision: Intelligence Alert</h3>
                <span className="vision-ref">Door #8812</span>
              </div>
              <p className="vision-body">
                New competitor promo detected for <strong>Rare Beauty</strong>. They have secured a high-visibility end-cap display for &apos;Soft Pinch&apos; liquid blushes at this location.
              </p>
            </div>
            <div className="vision-action">
              <p className="vision-action-label">AI Recommended Action</p>
              <p className="vision-action-text">Deploy &apos;Silk Glow&apos; shelf talkers to counter.</p>
            </div>
          </div>
        </div>

        {/* Billing & AI Usage */}
        <div className="card card-animated card-full" style={{ marginTop: '1rem' }}>
          <div className="usage-header">
            <h3 className="card-title">Account Intelligence Usage</h3>
            <div style={{ textAlign: 'right' }}>
              <p className="usage-edition-label">Current Edition</p>
              <p className="usage-edition-value">Solo AE</p>
            </div>
          </div>
          <div className="briefing-grid" style={{ gap: '3.5rem' }}>
            <div className="progress-group">
              <div className="progress-label">
                <span className="progress-name">AI Proactive Briefings</span>
                <span className="progress-value">4 / 5</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '80%' }} />
              </div>
              <p className="progress-footer">Cycle ends in 8 days</p>
            </div>
            <div className="progress-group">
              <div className="progress-label">
                <span className="progress-name">POS Insight Multi-Credits</span>
                <span className="progress-value">7 / 10</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill progress-fill--reverse" style={{ width: '70%' }} />
              </div>
              <p className="progress-footer">Cycle ends in 8 days</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <a href="/pricing" className="upgrade-link">
                View Plans & Upgrade →
              </a>
            </div>
          </div>
        </div>
      </div>

      {showDigest && <DigestSettings onClose={() => setShowDigest(false)} />}
    </div>
  );
}
