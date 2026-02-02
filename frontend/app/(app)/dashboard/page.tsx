'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { authenticatedFetch } from '@/lib/api';

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

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoadingEvents(false);
        return;
      }

      const response = await authenticatedFetch(`/api/calendar/events?user_id=${user.id}`);
      if (response.ok) {
        const events = await response.json();
        // Show only next 3 events
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

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ` at ${timeStr}`;
  };

  return (
    <div style={{ animation: 'fadeIn 1s ease-out' }}>
      <h1>Beauty Command Center</h1>
      <p style={{ opacity: 0.6, marginBottom: '3rem', fontSize: '1.1rem' }}>
        Welcome back, AE. Your AI-optimized priority list is ready.
      </p>

      <div className="grid">
        {/* Daily Priorities Card */}
        <div className="card" style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Daily Priorities</h3>
            <span style={{
              background: 'rgba(229, 185, 196, 0.15)',
              color: 'var(--primary)',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.7rem',
              fontWeight: '800',
              border: '1px solid rgba(229, 185, 196, 0.2)'
            }}>3 PENDING</span>
          </div>
          <ul style={{ listStyle: 'none', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              "Follow up with Sephora Times Square",
              "Analyze last week's POS for Ulta Region 4",
              "Prepare training script for holiday launch"
            ].map((task, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', fontSize: '0.95rem', opacity: 0.9 }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 8px var(--primary)'
                }} />
                {task}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions Card */}
        <div className="card" style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.2s' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={() => router.push('/visits')} style={{ gap: '0.75rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🎙️</span> Record Store Visit
            </button>
            <button onClick={() => router.push('/pos')} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)',
              color: 'var(--foreground)',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.1rem' }}>📈</span> Upload POS Data
            </button>
            <button onClick={() => router.push('/integrations')} style={{
              background: 'rgba(192, 132, 252, 0.1)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              color: 'var(--accent)',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>📸</span> Competitive Snapshot
            </button>
          </div>
        </div>

        {/* Upcoming Calendar Events */}
        <div className="card" style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.25s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Upcoming Visits</h3>
            <button
              onClick={() => router.push('/integrations')}
              style={{
                fontSize: '0.75rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)'
              }}
            >
              {upcomingEvents.length > 0 ? '📅' : '+ Connect'}
            </button>
          </div>

          {loadingEvents ? (
            <div style={{ marginTop: '1.5rem', opacity: 0.5 }}>
              <p>Loading calendar events...</p>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <ul style={{ listStyle: 'none', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingEvents.map((event, i) => (
                <li
                  key={event.id}
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    transition: 'var(--transition)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem', marginTop: '0.1rem' }}>📅</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                        {event.summary}
                      </p>
                      <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                        {formatEventTime(event.start)}
                      </p>
                      {event.location && (
                        <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.25rem' }}>
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{
              marginTop: '1.5rem',
              padding: '2rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px dashed var(--glass-border)'
            }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>📅</span>
              <p style={{ marginTop: '0.75rem', opacity: 0.6, fontSize: '0.9rem' }}>
                No upcoming events
              </p>
              <p style={{ marginTop: '0.25rem', opacity: 0.4, fontSize: '0.85rem' }}>
                Connect your calendar to see visits here
              </p>
            </div>
          )}
        </div>

        {/* Performance Overview */}
        <div className="card" style={{
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
          animationDelay: '0.3s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)'
        }}>
          <h3 style={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>Region Performance</h3>
          <p style={{
            fontSize: '4.5rem',
            fontWeight: '900',
            margin: '0.5rem 0',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 12px rgba(192, 132, 252, 0.2))'
          }}>+12.4%</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }}>
            <span style={{ color: '#4ade80' }}>↗</span>
            <span style={{ fontSize: '0.95rem' }}>Sell-through lift vs. Last Month</span>
          </div>
        </div>

        {/* Proactive Briefing Widget */}
        <div className="card glass-morphism" style={{
          gridColumn: '1 / -1',
          borderLeft: '5px solid var(--primary)',
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
          animationDelay: '0.4s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  padding: '2px 8px',
                  background: 'var(--primary)',
                  color: '#000',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  fontWeight: '900'
                }}>LIVE</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Upcoming Briefing (in 15m)</span>
              </div>
              <h2 style={{ marginTop: '0.5rem', fontSize: '1.75rem', letterSpacing: '-1px' }}>Sephora Times Square - Holiday Refresh</h2>
            </div>
            <button onClick={() => router.push('/visits')} style={{ padding: '0.8rem 1.75rem', fontSize: '0.95rem' }}>Open Strategic Brief</button>
          </div>
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.4, textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px' }}>Last Visit Critical Issue</p>
              <p style={{ fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: '500' }}>🚨 Out of stock on Hydra-Silk Serum (Shelf Share -8%)</p>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.4, textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px' }}>POS Performance Highlight</p>
              <p style={{ fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: '500' }}>📈 +22% lift in 'Glow Kit' sales vs. same period Y1</p>
            </div>
          </div>
        </div>

        {/* AI Vision Insight Card */}
        <div className="card glass-morphism" style={{
          gridColumn: '1 / -1',
          background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.08) 0%, rgba(15, 15, 19, 0.8) 100%)',
          border: '1px solid rgba(192, 132, 252, 0.25)',
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
          animationDelay: '0.5s'
        }}>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              boxShadow: '0 8px 32px rgba(192, 132, 252, 0.4)',
              position: 'relative'
            }}>
              📸
              <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '12px', height: '12px', background: '#ff4b4b', borderRadius: '50%', border: '2px solid var(--background)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ color: 'var(--accent)', fontSize: '1.35rem', fontWeight: '800' }}>AI Vision: Intelligence Alert</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Door #8812</span>
              </div>
              <p style={{ marginTop: '0.6rem', opacity: 0.85, fontSize: '1.1rem', lineHeight: '1.5' }}>
                New competitor promo detected for <strong>Rare Beauty</strong>. They have secured a high-visibility end-cap display for 'Soft Pinch' liquid blushes at this location.
              </p>
            </div>
            <div style={{ textAlign: 'right', paddingLeft: '2.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', minWidth: '280px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '2px' }}>AI Recommended Action</p>
              <p style={{ fontWeight: '700', marginTop: '0.75rem', fontSize: '1.2rem', color: '#fff' }}>Deploy 'Silk Glow' shelf talkers to counter.</p>
            </div>
          </div>
        </div>

        {/* Billing & AI Usage */}
        <div className="card" style={{
          gridColumn: '1 / -1',
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
          animationDelay: '0.6s',
          marginTop: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Account Intelligence Usage</h3>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Current Edition</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '800', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Solo AE</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>AI Proactive Briefings</span>
                <span style={{ fontSize: '1rem', fontWeight: '800' }}>4 / 5</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', height: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'var(--primary-gradient)', width: '80%', height: '100%', borderRadius: '10px', boxShadow: '0 0 15px rgba(229, 185, 196, 0.4)' }}></div>
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.3, marginTop: '0.75rem' }}>Cycles ends in 8 days</p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>POS Insight Multi-Credits</span>
                <span style={{ fontSize: '1rem', fontWeight: '800' }}>7 / 10</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', height: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'linear-gradient(90deg, #c084fc 0%, #e5b9c4 100%)', width: '70%', height: '100%', borderRadius: '10px', boxShadow: '0 0 15px rgba(192, 132, 252, 0.4)' }}></div>
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.3, marginTop: '0.75rem' }}>Cycles ends in 8 days</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <a href="/pricing" style={{
                color: 'var(--foreground)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '700',
                padding: '0.85rem 1.75rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: '14px',
                transition: 'var(--transition)'
              }} onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }} onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}>
                View Plans & Upgrade →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
