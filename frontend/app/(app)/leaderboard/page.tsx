'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TeamMember {
  rank: number;
  name: string;
  avatar: string;
  region: string;
  visits: number;
  revenue: number;
  conversion: number;
  trend: 'up' | 'down' | 'flat';
  isYou?: boolean;
}

const sampleData: TeamMember[] = [
  { rank: 1, name: 'Sarah Chen', avatar: 'SC', region: 'Northeast', visits: 32, revenue: 78500, conversion: 85, trend: 'up' },
  { rank: 2, name: 'Marcus Williams', avatar: 'MW', region: 'Southeast', visits: 28, revenue: 72100, conversion: 82, trend: 'up' },
  { rank: 3, name: 'You', avatar: 'YO', region: 'Mid-Atlantic', visits: 25, revenue: 65400, conversion: 78, trend: 'up', isYou: true },
  { rank: 4, name: 'Priya Patel', avatar: 'PP', region: 'West Coast', visits: 24, revenue: 61200, conversion: 76, trend: 'flat' },
  { rank: 5, name: 'James Rivera', avatar: 'JR', region: 'Midwest', visits: 22, revenue: 58800, conversion: 74, trend: 'down' },
  { rank: 6, name: 'Aisha Johnson', avatar: 'AJ', region: 'Southwest', visits: 20, revenue: 54300, conversion: 71, trend: 'flat' },
  { rank: 7, name: 'Daniel Kim', avatar: 'DK', region: 'Pacific NW', visits: 18, revenue: 49700, conversion: 68, trend: 'up' },
  { rank: 8, name: 'Lisa Thompson', avatar: 'LT', region: 'Mountain', visits: 16, revenue: 44200, conversion: 65, trend: 'down' },
];

type SortKey = 'revenue' | 'visits' | 'conversion';

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortKey>('revenue');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [isPro] = useState(true); // Would check actual subscription

  if (!isPro) {
    return (
      <div className="page-fade-in">
        <h1>Team Leaderboard</h1>
        <div className="card leaderboard-upgrade">
          <h2>Pro / Enterprise Feature</h2>
          <p>Upgrade to Pro or Enterprise to access team leaderboards, performance comparisons, and competitive rankings.</p>
          <Link href="/pricing">View Plans →</Link>
        </div>
      </div>
    );
  }

  const sorted = [...sampleData].sort((a, b) => b[sortBy] - a[sortBy]).map((m, i) => ({ ...m, rank: i + 1 }));

  return (
    <div className="page-fade-in">
      <h1>Team Leaderboard</h1>
      <p className="page-subtitle">See how you stack up against your team this {period}.</p>

      {/* Controls */}
      <div className="leaderboard-controls">
        <div className="templates-filters">
          {(['week', 'month', 'quarter'] as const).map(p => (
            <button
              key={p}
              className={`templates-filter-btn ${period === p ? 'templates-filter-btn--active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              This {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="templates-filters">
          {([
            { key: 'revenue' as const, label: 'Revenue' },
            { key: 'visits' as const, label: 'Visits' },
            { key: 'conversion' as const, label: 'Conversion' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              className={`templates-filter-btn ${sortBy === key ? 'templates-filter-btn--active' : ''}`}
              onClick={() => setSortBy(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="leaderboard-podium">
        {sorted.slice(0, 3).map((member, i) => (
          <div key={member.name} className={`leaderboard-podium-item leaderboard-podium-item--${i + 1} ${member.isYou ? 'leaderboard-podium-item--you' : ''}`}>
            <div className="leaderboard-podium-rank">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
            </div>
            <div className="leaderboard-avatar" style={{ background: member.isYou ? 'var(--primary)' : 'var(--accent)' }}>
              {member.avatar}
            </div>
            <p className="leaderboard-podium-name">{member.isYou ? 'You' : member.name}</p>
            <p className="leaderboard-podium-region">{member.region}</p>
            <p className="leaderboard-podium-stat">
              {sortBy === 'revenue' ? `$${member.revenue.toLocaleString()}` :
               sortBy === 'visits' ? `${member.visits} visits` :
               `${member.conversion}%`}
            </p>
          </div>
        ))}
      </div>

      {/* Full Rankings Table */}
      <div className="card leaderboard-table-card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Full Rankings</h3>
        <div className="leaderboard-table">
          <div className="leaderboard-row leaderboard-row--header">
            <span className="leaderboard-col-rank">#</span>
            <span className="leaderboard-col-name">Team Member</span>
            <span className="leaderboard-col-region">Region</span>
            <span className="leaderboard-col-stat">Visits</span>
            <span className="leaderboard-col-stat">Revenue</span>
            <span className="leaderboard-col-stat">Conv.</span>
            <span className="leaderboard-col-trend">Trend</span>
          </div>
          {sorted.map(member => (
            <div key={member.name} className={`leaderboard-row ${member.isYou ? 'leaderboard-row--you' : ''}`}>
              <span className="leaderboard-col-rank">{member.rank}</span>
              <span className="leaderboard-col-name">
                <span className="leaderboard-avatar-sm" style={{ background: member.isYou ? 'var(--primary)' : 'var(--glass)' }}>
                  {member.avatar}
                </span>
                {member.isYou ? 'You' : member.name}
              </span>
              <span className="leaderboard-col-region">{member.region}</span>
              <span className="leaderboard-col-stat">{member.visits}</span>
              <span className="leaderboard-col-stat">${member.revenue.toLocaleString()}</span>
              <span className="leaderboard-col-stat">{member.conversion}%</span>
              <span className={`leaderboard-col-trend goals-trend--${member.trend}`}>
                {member.trend === 'up' ? '↗' : member.trend === 'down' ? '↘' : '→'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
