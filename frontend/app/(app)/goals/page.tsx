'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface KPI {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  color: string;
}

const defaultKPIs: KPI[] = [
  { id: 'visits', label: 'Store Visits This Month', current: 18, target: 25, unit: 'visits', trend: 'up', color: '#e5b9c4' },
  { id: 'revenue', label: 'Monthly Revenue Target', current: 42500, target: 60000, unit: '$', trend: 'up', color: '#c084fc' },
  { id: 'conversion', label: 'Visit-to-Order Rate', current: 68, target: 80, unit: '%', trend: 'up', color: '#84e5c0' },
  { id: 'doors', label: 'New Doors Opened', current: 3, target: 5, unit: 'doors', trend: 'flat', color: '#e5d484' },
  { id: 'training', label: 'Trainings Delivered', current: 7, target: 10, unit: 'sessions', trend: 'up', color: '#84b9e5' },
  { id: 'response', label: 'Avg. Follow-up Time', current: 4, target: 2, unit: 'hours', trend: 'down', color: '#e58484' },
];

function ProgressRing({ percent, color, size = 100 }: { percent: number; color: string; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--foreground)"
        fontSize={size * 0.22}
        fontWeight={700}
        fontFamily="var(--font-serif)"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

export default function GoalsPage() {
  const [kpis, setKPIs] = useState<KPI[]>(defaultKPIs);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const trendIcon = (trend: string) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getPercent = (kpi: KPI) => {
    if (kpi.id === 'response') return Math.max(0, ((kpi.target / kpi.current) * 100));
    return (kpi.current / kpi.target) * 100;
  };

  const formatValue = (kpi: KPI) => {
    if (kpi.unit === '$') return `$${kpi.current.toLocaleString()}`;
    if (kpi.unit === '%') return `${kpi.current}%`;
    return `${kpi.current}`;
  };

  const formatTarget = (kpi: KPI) => {
    if (kpi.unit === '$') return `$${kpi.target.toLocaleString()}`;
    if (kpi.unit === '%') return `${kpi.target}%`;
    return `${kpi.target} ${kpi.unit}`;
  };

  const handleUpdateTarget = (id: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid target');
      return;
    }
    setKPIs(kpis.map(k => k.id === id ? { ...k, target: val } : k));
    setEditing(null);
    toast.success('Target updated!');
  };

  const overallProgress = Math.round(
    kpis.reduce((sum, kpi) => sum + Math.min(getPercent(kpi), 100), 0) / kpis.length
  );

  return (
    <div className="page-fade-in">
      <h1>Goal Tracker</h1>
      <p className="page-subtitle">Track your KPIs and stay ahead of your targets.</p>

      {/* Overall Progress */}
      <div className="card card-animated goals-overview">
        <div className="goals-overview-ring">
          <ProgressRing percent={overallProgress} color="#e5b9c4" size={140} />
        </div>
        <div className="goals-overview-text">
          <h2 className="goals-overview-title">Overall Performance</h2>
          <p className="goals-overview-subtitle">
            You&apos;re at <strong>{overallProgress}%</strong> of your combined monthly targets.
            {overallProgress >= 80 ? ' Outstanding pace!' : overallProgress >= 60 ? ' On track — keep pushing!' : ' Room to grow. Focus on your key metrics.'}
          </p>
          <div className="goals-overview-stats">
            <div className="goals-stat">
              <span className="goals-stat-value">{kpis.filter(k => getPercent(k) >= 100).length}</span>
              <span className="goals-stat-label">Goals Met</span>
            </div>
            <div className="goals-stat">
              <span className="goals-stat-value">{kpis.filter(k => getPercent(k) >= 70 && getPercent(k) < 100).length}</span>
              <span className="goals-stat-label">On Track</span>
            </div>
            <div className="goals-stat">
              <span className="goals-stat-value">{kpis.filter(k => getPercent(k) < 70).length}</span>
              <span className="goals-stat-label">Needs Focus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual KPIs */}
      <div className="grid goals-grid">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="card card-animated goals-kpi-card">
            <div className="goals-kpi-header">
              <h4 className="goals-kpi-label">{kpi.label}</h4>
              <span className={`goals-trend goals-trend--${kpi.trend}`}>
                {trendIcon(kpi.trend)}
              </span>
            </div>
            <div className="goals-kpi-body">
              <ProgressRing percent={getPercent(kpi)} color={kpi.color} size={80} />
              <div className="goals-kpi-values">
                <p className="goals-kpi-current">{formatValue(kpi)}</p>
                <p className="goals-kpi-target">
                  Target: {editing === kpi.id ? (
                    <span className="goals-edit-inline">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateTarget(kpi.id)}
                        autoFocus
                        className="goals-edit-input"
                      />
                      <button className="goals-edit-save" onClick={() => handleUpdateTarget(kpi.id)}>Save</button>
                    </span>
                  ) : (
                    <span
                      className="goals-target-editable"
                      onClick={() => { setEditing(kpi.id); setEditValue(String(kpi.target)); }}
                      title="Click to edit target"
                    >
                      {formatTarget(kpi)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
