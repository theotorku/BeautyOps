'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email service
    alert(`Thanks! We'll send the template to ${email}`);
    setEmail('');
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo">✨ BeautyOps AI</div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link href="/dashboard" className="landing-cta-small">Launch App →</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">🚀 AI-Powered Workflow Engine</div>
        <h1 className="hero-title">
          From Field Notes to<br />
          <span className="gradient-text">Strategic Intel</span><br />
          in 60 Seconds
        </h1>
        <p className="hero-subtitle">
          The AI assistant that transforms how Beauty Account Executives work.
          Automate reports, analyze POS data, and prep for store visits — all in one platform.
        </p>
        <div className="hero-cta">
          <Link href="/signup" className="btn-primary">Start Free Trial</Link>
          <a href="#features" className="btn-secondary">See How It Works</a>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">4hrs</span>
            <span className="stat-label">Saved per week</span>
          </div>
          <div className="stat">
            <span className="stat-number">87%</span>
            <span className="stat-label">Faster reporting</span>
          </div>
          <div className="stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Active AEs</span>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="pain-points">
        <h2 className="section-title">Sound Familiar?</h2>
        <div className="pain-grid">
          <div className="pain-card">
            <span className="pain-icon">😩</span>
            <h3>Hours on Reports</h3>
            <p>Spending evenings writing up store visits instead of actually selling.</p>
          </div>
          <div className="pain-card">
            <span className="pain-icon">📊</span>
            <h3>Data Overload</h3>
            <p>POS spreadsheets are overwhelming. Finding insights feels impossible.</p>
          </div>
          <div className="pain-card">
            <span className="pain-icon">🏃</span>
            <h3>Always Reactive</h3>
            <p>No time for strategy when you're always catching up on admin.</p>
          </div>
          <div className="pain-card">
            <span className="pain-icon">📝</span>
            <h3>Training Prep Hell</h3>
            <p>Creating materials for product launches eats up precious selling time.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <h2 className="section-title">Your AI-Powered Command Center</h2>
        <p className="section-subtitle">Everything you need to crush your numbers, powered by GPT-4</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎙️</div>
            <h3>Store Visit Intelligence</h3>
            <p>Voice-to-report in seconds. AI extracts action items, inventory issues, and auto-drafts follow-up emails.</p>
          </div>
          <div className="feature-card featured">
            <div className="feature-icon">📈</div>
            <h3>POS Sales Insights</h3>
            <p>Upload any spreadsheet. Get top sellers, slow movers, shade gaps, and strategic recommendations instantly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Training Generator</h3>
            <p>Product specs → 10-minute training scripts, selling points, and quizzes. Ready in one click.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Competitive Snapshot</h3>
            <p>Upload shelf photos. AI identifies competitor promos and recommends counter-strategies.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">Get Started in 3 Steps</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Capture</h3>
            <p>Record voice notes, upload POS files, or snap shelf photos</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Process</h3>
            <p>AI analyzes and transforms your raw data into structured insights</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Act</h3>
            <p>Get actionable reports, recommendations, and ready-to-send emails</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <h2 className="section-title">Investment Tiers</h2>
        <p className="section-subtitle">Start free. Scale when you're ready.</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-tier">Solo AE</div>
            <div className="pricing-price">$49<span>/mo</span></div>
            <ul className="pricing-features">
              <li>✓ Unlimited store visit reports</li>
              <li>✓ 10 POS analysis credits</li>
              <li>✓ Basic task management</li>
              <li>✓ Email support</li>
            </ul>
            <Link href="/signup" className="btn-secondary">Start Free Trial</Link>
          </div>
          <div className="pricing-card popular">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-tier">Pro AE</div>
            <div className="pricing-price">$149<span>/mo</span></div>
            <ul className="pricing-features">
              <li>✓ Everything in Solo</li>
              <li>✓ Unlimited POS analysis</li>
              <li>✓ Training & Content generators</li>
              <li>✓ Proactive AI Briefings</li>
              <li>✓ Priority support</li>
            </ul>
            <Link href="/signup" className="btn-primary">Start Free Trial</Link>
          </div>
          <div className="pricing-card">
            <div className="pricing-tier">Enterprise</div>
            <div className="pricing-price">Custom</div>
            <ul className="pricing-features">
              <li>✓ Everything in Pro</li>
              <li>✓ SSO & team management</li>
              <li>✓ CRM/ERP integrations</li>
              <li>✓ Brand-trained AI models</li>
              <li>✓ Dedicated success manager</li>
            </ul>
            <a href="mailto:enterprise@beautyops.ai" className="btn-secondary">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* Lead Magnet */}
      <section className="lead-magnet">
        <div className="lead-magnet-content">
          <h2>📋 Free: The AE's Store Visit Template</h2>
          <p>The exact template top Beauty AEs use to capture winning insights. Download free.</p>
          <form onSubmit={handleSubmit} className="lead-form">
            <input
              type="email"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Get Free Template</button>
          </form>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <h2>Ready to Transform Your Workflow?</h2>
        <p>Join 500+ Beauty AEs who are saving 4+ hours every week.</p>
        <Link href="/signup" className="btn-primary btn-large">Start Your Free Trial →</Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="landing-logo">✨ BeautyOps AI</span>
            <p>AI Workflow Engine for Beauty Account Executives</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="mailto:support@beautyops.ai">Support</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 BeautyOps AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
