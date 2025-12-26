import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeautyOps AI | AE Workflow Engine",
  description: "Intelligent assistant for Beauty Account Executives",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="dashboard-layout">
          <aside className="sidebar">
            <div className="logo">BeautyOps AI</div>
            <nav className="nav">
              <a href="/" className="nav-item active">
                <span>🏠</span> Dashboard
              </a>
              <a href="/visits" className="nav-item">
                <span>🎙️</span> Store Visits
              </a>
              <a href="/pos" className="nav-item">
                <span>📊</span> POS Analysis
              </a>
              <a href="/training" className="nav-item">
                <span>📖</span> Training
              </a>
              <a href="/integrations" className="nav-item">
                <span>🔗</span> Integrations
              </a>
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <a href="/pricing" className="nav-item" style={{ background: 'rgba(229, 185, 196, 0.05)', color: 'var(--primary)', opacity: 1, border: '1px solid var(--glass-border)' }}>
                  <span>✨</span> Plans & Billing
                </a>
              </div>
            </nav>
          </aside>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
