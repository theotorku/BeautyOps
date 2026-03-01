'use client';

import { useState } from 'react';
import { authenticatedFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TrainingGenerator() {
    const [productInfo, setProductInfo] = useState('');
    const [training, setTraining] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!productInfo || productInfo.trim().length < 10) {
            toast.error('Please provide more product details (at least 10 characters).');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('Designing your training package...');
        try {
            const res = await authenticatedFetch('/api/features/generate-training', {
                method: 'POST',
                body: JSON.stringify({ product_info: productInfo })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to generate training');
            }

            const data = await res.json();
            setTraining(data);
            toast.dismiss(loadingToast);
            toast.success('Training package ready!');
        } catch (err: any) {
            toast.dismiss(loadingToast);
            toast.error(err.message || 'Generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', animation: 'fadeIn 0.8s ease-out' }}>
            <h1>Training Generator</h1>
            <p className="page-subtitle">Generate professional training scripts and selling points for any product launch.</p>

            <div className="card card-animated" style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Product Information</h3>
                <textarea
                    className="input-area input-area--short"
                    placeholder="Enter product details or key features..."
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                />
                <button onClick={handleGenerate} disabled={loading || !productInfo} className="btn-full-mt">
                    {loading ? 'Designing Training...' : 'Generate Training Package'}
                </button>
            </div>

            {training && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'slideUp 0.6s ease-out both' }}>
                    <div className="card">
                        <h3 className="card-title" style={{ color: 'var(--primary)' }}>10-Minute Training Script</h3>
                        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', opacity: 0.8, fontFamily: 'var(--font-serif)', fontSize: '1.05rem', lineHeight: 1.7 }}>{training.script}</pre>
                    </div>
                    <div className="grid">
                        <div className="card">
                            <h3 className="card-title" style={{ color: 'var(--primary)' }}>Key Selling Points</h3>
                            <ul className="report-list" style={{ marginTop: '1rem' }}>
                                {training.key_selling_points.map((p: string, i: number) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                        <div className="card">
                            <h3 className="card-title" style={{ color: 'var(--primary)' }}>Objection Handling</h3>
                            <p style={{ marginTop: '1rem', opacity: 0.8, lineHeight: 1.6 }}>{training.objection_handling}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
