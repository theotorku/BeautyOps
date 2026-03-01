'use client';

import { useState, useRef } from 'react';
import { authenticatedFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import ExportPDF from '@/components/ExportPDF';
import VoiceInput from '@/components/VoiceInput';

export default function StoreVisits() {
    const [transcript, setTranscript] = useState('');
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleProcess = async () => {
        if (!transcript || transcript.trim().length < 10) {
            toast.error('Please provide more detail in your visit notes.');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('AI is analyzing your visit notes...');
        try {
            const res = await authenticatedFetch('/api/visits/process-transcript', {
                method: 'POST',
                body: JSON.stringify({ transcript })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to process transcript');
            }

            const data = await res.json();
            setReport(data);
            toast.dismiss(loadingToast);
            toast.success('Intelligence report generated!');
        } catch (err: any) {
            toast.dismiss(loadingToast);
            toast.error(err.message || 'Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyEmail = () => {
        if (report?.follow_up_email) {
            navigator.clipboard.writeText(report.follow_up_email);
            toast.success('Email draft copied to clipboard!');
        }
    };

    return (
        <div className="page-container--narrow" style={{ maxWidth: '1000px' }}>
            <h1>Store Visit Intelligence</h1>
            <p className="page-subtitle">
                Transform your raw field notes into strategic retail reports in seconds.
            </p>

            <div className="card card-animated" style={{ marginBottom: '2.5rem' }}>
                <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Capture Visit Snapshot</h3>
                <textarea
                    className="input-area"
                    placeholder="Describe your visit, inventory observations, or competitor moves..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                />
                <div className="btn-row">
                    <button
                        onClick={handleProcess}
                        disabled={loading || !transcript}
                        style={{ flex: 1 }}
                    >
                        {loading ? 'AI analyzing...' : 'Generate Intelligence Report'}
                    </button>
                    <VoiceInput
                        onTranscript={(text) => setTranscript(prev => prev ? prev + ' ' + text : text)}
                        disabled={loading}
                    />
                </div>
            </div>

            {report && (
                <div style={{ animation: 'slideUp 0.6s ease-out both' }} ref={reportRef}>
                    <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                        <div className="card-header" style={{ marginBottom: '2rem', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Strategic Report</h2>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <ExportPDF targetRef={reportRef} filename="Store-Visit-Report" label="Export" />
                                <span className="vision-ref">REF: #GPT4-REP-01</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="report-section">
                                <strong className="report-label">Executive Summary</strong>
                                <p className="report-body">{report.summary}</p>
                            </div>

                            <div className="report-grid">
                                <div className="report-alert">
                                    <strong className="report-label report-label--danger">Inventory Alerts</strong>
                                    <ul className="report-list">
                                        {report.inventory_issues.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="report-success">
                                    <strong className="report-label report-label--success">Field Actions</strong>
                                    <ul className="report-list">
                                        {report.action_items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div className="email-draft">
                                <div className="email-draft-actions">
                                    <button className="btn-ghost" onClick={copyEmail} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Copy Draft</button>
                                </div>
                                <strong className="report-label report-label--muted">Draft Follow-up Email</strong>
                                <pre>{report.follow_up_email}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
