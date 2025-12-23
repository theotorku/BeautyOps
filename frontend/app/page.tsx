export default function Dashboard() {
  return (
    <div>
      <h1>Welcome back, AE</h1>
      <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Here is your AI-optimized priority list for today.</p>

      <div className="grid">
        <div className="card">
          <h3>Daily Priority List</h3>
          <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flex_direction: 'column', gap: '0.75rem' }}>
            <li style={{ opacity: 0.8 }}>✨ Follow up with Sephora Times Square</li>
            <li style={{ opacity: 0.8 }}>✨ Analyze last week's POS for Ulta Region 4</li>
            <li style={{ opacity: 0.8 }}>✨ Prepare training script for holiday launch</li>
          </ul>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flex_direction: 'column', gap: '1rem', marginTop: '1rem' }}>
            <button>Record Store Visit</button>
            <button style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
              Upload POS Data
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Recent Performance</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', marginTop: '1rem' }}>+12.4%</p>
          <p style={{ opacity: 0.6 }}>Sell-through lift across region</p>
        </div>
      </div>
    </div>
  );
}
