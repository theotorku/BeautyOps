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
              <a href="/" className="nav-item active">Dashboard</a>
              <a href="/visits" className="nav-item">Store Visits</a>
              <a href="/pos" className="nav-item">POS Analysis</a>
              <a href="/training" className="nav-item">Training</a>
              <a href="/tasks" className="nav-item">Tasks</a>
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
