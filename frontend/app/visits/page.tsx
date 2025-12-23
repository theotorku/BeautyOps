'use client';

import { useState } from 'react';

export default function StoreVisits() {
    const [transcript, setTranscript] = useState('');
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleProcess = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/visits/process-transcript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transcript) // Note: Backend expects a raw string or JSON based on implementation
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
        <div style={{ maxWidth: '900px' }}>
            <h1>Store Visit Analysis</h1>
            <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Record or paste your visit notes to generate an AI report.</p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Transcribe Visit</h3>
                <textarea
                    placeholder="Paste your voice-to-text transcript here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    style={{
                        width: '100%',
                        height: '150px',
                        background: 'var(--background)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: '#fff',
                        padding: '1rem',
                        marginTop: '1rem',
                        fontFamily: 'inherit'
                    }}
                />
                <button
                    onClick={handleProcess}
                    disabled={loading || !transcript}
                    style={{ mt: '1rem', width: '100%' }}
                >
                    {loading ? 'Processing with AI...' : 'Generate Report'}
                </button>
            </div>

            {report && (
                <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="card">
                        <h2 style={{ color: var(--primary), marginBottom: '1rem' }}>AI Visit Report</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <strong>Summary:</strong>
                            <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>{report.summary}</p>
                        </div>
                        <div>
                            <strong>Inventory Issues:</strong>
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                {report.inventory_issues.map((item: string, i: number) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <strong>Action Items:</strong>
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                {report.action_items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <strong>Draft Follow-up Email:</strong>
                            <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
                                {report.follow_up_email}
                            </pre>
                        </div>
                    </div>
                </div>
        </div>
    )
}
    </div >
  );
}
