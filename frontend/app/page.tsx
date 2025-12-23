export default function Dashboard() {
  return (
    <div>
      <h1>Welcome back, AE</h1>
      <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Here is your AI-optimized priority list for today.</p>

      <div className="grid">
        <div className="card">
          <h3>Daily Priority List</h3>
          <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ opacity: 0.8 }}>✨ Follow up with Sephora Times Square</li>
            <li style={{ opacity: 0.8 }}>✨ Analyze last week's POS for Ulta Region 4</li>
            <li style={{ opacity: 0.8 }}>✨ Prepare training script for holiday launch</li>
          </ul>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <button>Record Store Visit</button>
            <button style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
              Upload POS Data
            </button>
            <button style={{ background: 'var(--accent)', color: '#000' }}>
              📸 Competitive Snapshot
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Recent Performance</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', marginTop: '1rem' }}>+12.4%</p>
          <p style={{ opacity: 0.6 }}>Sell-through lift across region</p>
        </div>

        <div className="card glass-morphism" style={{ gridColumn: '1 / -1', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>Upcoming Briefing (in 15m)</span>
              <h3 style={{ marginTop: '0.25rem' }}>Sephora Times Square - Holiday Refresh</h3>
            </div>
            <button style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>View Full Brief</button>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Last Visit Issue</p>
              <p style={{ fontSize: '0.9rem' }}>Out of stock on Hydra-Silk Serum</p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>POS Highlight</p>
              <p style={{ fontSize: '0.9rem' }}>+22% lift in Glow Kit sales vs LY</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Billing & AI Usage</h3>
            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Current Plan: <strong>Solo AE</strong></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>AI Briefings</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>4 / 5</span>
              </div>
              <div style={{ background: 'var(--glass)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--primary)', width: '80%', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>POS Analysis</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>7 / 10</span>
              </div>
              <div style={{ background: 'var(--glass)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--accent)', width: '70%', height: '100%', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <a href="/pricing" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', transition: 'var(--transition)' }}>
                Upgrade Plan →
              </a>
            </div>
          </div>
        </div>

        <div className="card glass-morphism" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(229, 185, 196, 0.1) 0%, rgba(26, 26, 30, 0.7) 100%)', border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📸</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'var(--accent)' }}>AI Vision Insight: Competitor Move Detected</h3>
              <p style={{ marginTop: '0.25rem', opacity: 0.8 }}>"Rare Beauty" just launched a new end-cap display for 'Soft Pinch' blushes at this location.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)' }}>Tactical Recommendation</p>
              <p style={{ fontWeight: '600', marginTop: '0.25rem' }}>Counter-pitch 'Silk Glow' shelf talkers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
