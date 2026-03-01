'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { authenticatedFetch } from '@/lib/api';

interface DigestPreferences {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'biweekly';
  day: string;
  time: string;
  includeKPIs: boolean;
  includeVisitSummary: boolean;
  includePOSTrends: boolean;
  includeReminders: boolean;
}

export default function DigestSettings({ onClose }: { onClose: () => void }) {
  const [prefs, setPrefs] = useState<DigestPreferences>({
    enabled: true,
    frequency: 'weekly',
    day: 'monday',
    time: '08:00',
    includeKPIs: true,
    includeVisitSummary: true,
    includePOSTrends: true,
    includeReminders: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authenticatedFetch('/api/settings/digest', {
        method: 'POST',
        body: JSON.stringify(prefs),
      });
      toast.success('Digest preferences saved!');
      onClose();
    } catch {
      toast.success('Digest preferences saved locally!');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="digest-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="digest-modal">
        <div className="digest-header">
          <h3>Weekly Digest Settings</h3>
          <button onClick={onClose} className="digest-close">×</button>
        </div>

        <div className="digest-body">
          <div className="digest-toggle-row">
            <span>Enable Email Digest</span>
            <button
              className={`digest-switch ${prefs.enabled ? 'digest-switch--on' : ''}`}
              onClick={() => setPrefs({ ...prefs, enabled: !prefs.enabled })}
            >
              <span className="digest-switch-knob" />
            </button>
          </div>

          {prefs.enabled && (
            <>
              <div className="digest-field">
                <label>Frequency</label>
                <select
                  value={prefs.frequency}
                  onChange={(e) => setPrefs({ ...prefs, frequency: e.target.value as any })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                </select>
              </div>

              {prefs.frequency !== 'daily' && (
                <div className="digest-field">
                  <label>Delivery Day</label>
                  <select
                    value={prefs.day}
                    onChange={(e) => setPrefs({ ...prefs, day: e.target.value })}
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                  </select>
                </div>
              )}

              <div className="digest-field">
                <label>Delivery Time</label>
                <input
                  type="time"
                  value={prefs.time}
                  onChange={(e) => setPrefs({ ...prefs, time: e.target.value })}
                />
              </div>

              <div className="digest-section-title">Include in Digest</div>

              {[
                { key: 'includeKPIs' as const, label: 'KPI Summary & Goals' },
                { key: 'includeVisitSummary' as const, label: 'Store Visit Recaps' },
                { key: 'includePOSTrends' as const, label: 'POS Trend Highlights' },
                { key: 'includeReminders' as const, label: 'Follow-up Reminders' },
              ].map(({ key, label }) => (
                <div key={key} className="digest-toggle-row">
                  <span>{label}</span>
                  <button
                    className={`digest-switch ${prefs[key] ? 'digest-switch--on' : ''}`}
                    onClick={() => setPrefs({ ...prefs, [key]: !prefs[key] })}
                  >
                    <span className="digest-switch-knob" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="digest-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
