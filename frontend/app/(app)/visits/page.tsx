'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/config';

export default function StoreVisits() {
    const [transcript, setTranscript] = useState('');
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleProcess = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/visits/process-transcript`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript })
            });
            const data = await res.json();
            setReport(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', animation: 'fadeIn 0.8s ease-out' }}>
            <h1>Store Visit Intelligence</h1>
            <p style={{ opacity: 0.6, marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                Transform your raw field notes into strategic retail reports in seconds.
            </p>

            <div className="card" style={{ marginBottom: '2.5rem', animation: 'slideUp 0.6s ease-out both' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Capture Visit Snapshot</h3>
                <textarea
                    placeholder="Describe your visit, inventory observations, or competitor moves..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    style={{
                        width: '100%',
                        height: '180px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '16px',
                        color: '#fff',
                        padding: '1.25rem',
                        marginTop: '0.5rem',
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        resize: 'none'
                    }}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                        onClick={handleProcess}
                        disabled={loading || !transcript}
                        style={{ flex: 1, padding: '1rem' }}
                    >
                        {loading ? 'AI analyzing...' : 'Generate Intelligence Report'}
                    </button>
                    <button style={{
                        background: 'transparent',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--foreground)',
                        width: '60px',
                        padding: '0'
                    }}>
                        🎙️
                    </button>
                </div>
            </div>

            {report && (
                <div style={{ animation: 'slideUp 0.6s ease-out both' }}>
                    <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>AI Strategic Report</h2>
                            <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>REF: #GPT4-REP-01</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <strong style={{ color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Executive Summary</strong>
                                <p style={{ opacity: 0.9, marginTop: '0.75rem', fontSize: '1.05rem', lineHeight: '1.6' }}>{report.summary}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={{ border: '1px solid rgba(255,75,75,0.1)', background: 'rgba(255,75,75,0.02)', padding: '1.5rem', borderRadius: '16px' }}>
                                    <strong style={{ color: '#ff4b4b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Inventory Alerts</strong>
                                    <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {report.inventory_issues.map((item: string, i: number) => <li key={i} style={{ opacity: 0.8 }}>{item}</li>)}
                                    </ul>
                                </div>
                                <div style={{ border: '1px solid rgba(74,222,128,0.1)', background: 'rgba(74,222,128,0.02)', padding: '1.5rem', borderRadius: '16px' }}>
                                    <strong style={{ color: '#4ade80', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Field Actions</strong>
                                    <ul style={{ paddingLeft: '1.25rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {report.action_items.map((item: string, i: number) => <li key={i} style={{ opacity: 0.8 }}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div style={{ background: 'var(--background)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--glass-border)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                                    <button style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--foreground)' }}>Copy Draft</button>
                                </div>
                                <strong style={{ opacity: 0.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.5px' }}>Draft Follow-up Email</strong>
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    marginTop: '1.5rem',
                                    fontSize: '0.95rem',
                                    opacity: 0.9,
                                    fontFamily: 'serif',
                                    fontStyle: 'italic',
                                    color: 'var(--primary-accent)'
                                }}>
                                    {report.follow_up_email}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
