'use client';

import { useState } from 'react';
import { authenticatedFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export default function POSAnalysis() {
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        const loadingToast = toast.loading('AI is crunching your sales data...');
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await authenticatedFetch('/api/pos/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to analyze POS data');
            }

            const data = await res.json();
            setAnalysis(data);
            toast.dismiss(loadingToast);
            toast.success('POS analysis complete!');
        } catch (err: any) {
            toast.dismiss(loadingToast);
            toast.error(err.message || 'Analysis failed. Please check your file and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', animation: 'fadeIn 0.8s ease-out' }}>
            <h1>POS Sales Insights</h1>
            <p className="page-subtitle">Upload your weekly POS spreadsheet for AI-driven recommendations.</p>

            <div className="card card-animated" style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Upload Spreadsheet</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '1rem', marginTop: '0.5rem' }}>Supports .csv and .xlsx files</p>
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="file-input-spaced"
                />
                <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="btn-full"
                >
                    {loading ? 'Analyzing Data...' : 'Run Analysis'}
                </button>
            </div>

            {analysis && (
                <div className="grid" style={{ animation: 'slideUp 0.6s ease-out both' }}>
                    <div className="card">
                        <h3 className="card-title" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Top Sellers</h3>
                        <ul className="report-list">
                            {analysis.top_sellers.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="card">
                        <h3 className="card-title" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Growth Opportunities</h3>
                        <ul className="report-list">
                            {analysis.recommendations.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="card card-full">
                        <h3 className="card-title" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Market Trends</h3>
                        <ul className="report-list">
                            {analysis.trends.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
