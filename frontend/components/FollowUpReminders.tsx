'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface Reminder {
  id: string;
  store: string;
  action: string;
  urgency: 'high' | 'medium' | 'low';
  dueDate: string;
  source: string;
  dismissed: boolean;
}

const sampleReminders: Reminder[] = [
  {
    id: '1',
    store: 'Sephora Times Square',
    action: 'Restock check on Hydra-Silk Serum — was out of stock during last visit',
    urgency: 'high',
    dueDate: 'Today',
    source: 'Visit Report #GPT4-REP-01',
    dismissed: false,
  },
  {
    id: '2',
    store: 'Ulta Beauty - Region 4',
    action: 'Send updated POS analysis with shade gap recommendations',
    urgency: 'medium',
    dueDate: 'Tomorrow',
    source: 'POS Analysis - Feb 28',
    dismissed: false,
  },
  {
    id: '3',
    store: 'Bloomingdales SoHo',
    action: 'Schedule training session for new holiday collection launch',
    urgency: 'low',
    dueDate: 'This Friday',
    source: 'AI Recommendation',
    dismissed: false,
  },
  {
    id: '4',
    store: 'Nordstrom Flagship',
    action: 'Follow up on counter-strategy for competitor end-cap display',
    urgency: 'medium',
    dueDate: 'This Week',
    source: 'Competitive Snapshot',
    dismissed: false,
  },
];

const urgencyConfig = {
  high: { label: 'Urgent', color: '#e58484', bg: 'rgba(229, 132, 132, 0.1)' },
  medium: { label: 'Soon', color: '#e5d484', bg: 'rgba(229, 212, 132, 0.1)' },
  low: { label: 'Planned', color: '#84e5c0', bg: 'rgba(132, 229, 192, 0.1)' },
};

export default function FollowUpReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);

  const active = reminders.filter(r => !r.dismissed);
  const dismissed = reminders.filter(r => r.dismissed);

  const handleDismiss = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, dismissed: true } : r));
    toast.success('Reminder completed!');
  };

  const handleSnooze = (id: string) => {
    toast.success('Snoozed until tomorrow');
  };

  if (active.length === 0) return null;

  return (
    <div className="card card-animated card-full reminders-card">
      <div className="card-header">
        <h3 className="card-title">AI Follow-Up Reminders</h3>
        <span className="card-badge">{active.length} PENDING</span>
      </div>
      <div className="reminders-list">
        {active.map(reminder => (
          <div key={reminder.id} className="reminder-item">
            <div className="reminder-urgency">
              <span
                className="reminder-urgency-dot"
                style={{ background: urgencyConfig[reminder.urgency].color }}
              />
              <span
                className="reminder-urgency-label"
                style={{
                  color: urgencyConfig[reminder.urgency].color,
                  background: urgencyConfig[reminder.urgency].bg,
                }}
              >
                {urgencyConfig[reminder.urgency].label}
              </span>
            </div>
            <div className="reminder-content">
              <p className="reminder-store">{reminder.store}</p>
              <p className="reminder-action">{reminder.action}</p>
              <p className="reminder-meta">
                Due: {reminder.dueDate} · From: {reminder.source}
              </p>
            </div>
            <div className="reminder-actions">
              <button
                className="reminder-btn reminder-btn--done"
                onClick={() => handleDismiss(reminder.id)}
                title="Mark as done"
              >
                Done
              </button>
              <button
                className="reminder-btn reminder-btn--snooze"
                onClick={() => handleSnooze(reminder.id)}
                title="Snooze"
              >
                Snooze
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
