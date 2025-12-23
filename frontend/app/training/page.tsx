'use client';

import { useState } from 'react';

export default function TrainingGenerator() {
    const [productInfo, setProductInfo] = useState('');
    const [training, setTraining] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/features/generate-training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productInfo)
            });
            const data = await res.json();
            setTraining(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px' }}>
            <h1>Training Generator</h1>
            <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Generate professional training scripts and selling points for any product launch.</p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Product Information</h3>
                <textarea
                    placeholder="Enter product details or key features..."
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                    style={{
                        width: '100%',
                        height: '100px',
                        background: 'var(--background)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: '#fff',
                        padding: '1rem',
                        marginTop: '1rem'
                    }}
                />
                <button onClick={handleGenerate} disabled={loading || !productInfo} style={{ width: '100%', marginTop: '1rem' }}>
                    {loading ? 'Designing Training...' : 'Generate Training Package'}
                </button>
            </div>

            {training && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card">
                        <h3 style={{ color: 'var(--primary)' }}>10-Minute Training Script</h3>
                        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', opacity: 0.8 }}>{training.script}</pre>
                    </div>
                    <div className="grid">
                        <div className="card">
                            <h3 style={{ color: 'var(--primary)' }}>Key Selling Points</h3>
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '1rem' }}>
                                {training.key_selling_points.map((p: string, i: number) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                        <div className="card">
                            <h3 style={{ color: 'var(--primary)' }}>Objection Handling</h3>
                            <p style={{ marginTop: '1rem', opacity: 0.8 }}>{training.objection_handling}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
