'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/config';

export default function POSAnalysis() {
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/api/pos/analyze`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            setAnalysis(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px' }}>
            <h1>POS Sales Insights</h1>
            <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Upload your weekly POS spreadsheet for AI-driven recommendations.</p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Upload Spreadsheet</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '1rem' }}>Supports .csv files (XLSX support coming soon)</p>
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ marginBottom: '1rem' }}
                />
                <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    style={{ width: '100%' }}
                >
                    {loading ? 'Analyzing Data...' : 'Run Analysis'}
                </button>
            </div>

            {analysis && (
                <div className="grid">
                    <div className="card">
                        <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Top Sellers</h3>
                        <ul style={{ paddingLeft: '1.2rem', opacity: 0.8 }}>
                            {analysis.top_sellers.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="card">
                        <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Growth Opportunities</h3>
                        <ul style={{ paddingLeft: '1.2rem', opacity: 0.8 }}>
                            {analysis.recommendations.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Market Trends</h3>
                        <ul style={{ paddingLeft: '1.2rem', opacity: 0.8 }}>
                            {analysis.trends.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
