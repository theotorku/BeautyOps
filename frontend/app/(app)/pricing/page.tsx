export default function PricingPage() {
    const tiers = [
        {
            name: 'Solo AE',
            price: '$49',
            description: 'Essential toolkit for independent representatives.',
            features: [
                'Unlimited Store Visit Reports',
                'Basic Proactive Briefings',
                '10 AI POS Analysis Credits/mo',
                'Basic Calendar Sync'
            ],
            button: 'Current Plan',
            current: true
        },
        {
            name: 'Pro AE',
            price: '$149',
            description: 'The standard for high-performing beauty teams.',
            features: [
                'Everything in Solo',
                'Unlimited AI POS Analysis',
                'Advanced Proactive Briefing Engine',
                'Smart Calendar Time-Blocking',
                'Training & Content Generators',
                'Team Collaboration Hub'
            ],
            button: 'Upgrade to Pro',
            current: false,
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'Tailored solutions for global beauty brands.',
            features: [
                'Everything in Pro',
                'SSO & Advanced Security',
                'Direct CRM/SAP Integration',
                'AI Vision Competitive Insight',
                'Full Calendar Ecosystem Sync',
                'Custom Brand-Voice LLM'
            ],
            button: 'Contact Strategic Sales',
            current: false
        }
    ];

    return (
        <div className="page-container--wide">
            <h1 className="pricing-page-header">Investment Tiers</h1>
            <p className="pricing-page-subtitle">
                Choose the intelligence level that matches your field operations.
            </p>

            <div className="grid">
                {tiers.map((tier, idx) => (
                    <div key={idx} className={`card plan-card ${tier.popular ? 'plan-card--popular' : ''}`} style={{
                        gap: '2rem',
                        padding: '2.5rem',
                        animation: 'slideUp 0.6s ease-out both',
                        animationDelay: `${idx * 0.15}s`
                    }}>
                        {tier.popular && (
                            <span className="plan-recommended-badge">
                                RECOMMENDED
                            </span>
                        )}
                        <div>
                            <h2 className="plan-name" style={{ fontSize: '1.75rem' }}>{tier.name}</h2>
                            <p className="plan-description">{tier.description}</p>
                        </div>
                        <div className={`plan-price ${tier.popular ? 'plan-price--gradient' : ''}`} style={{ fontSize: '3.5rem' }}>
                            {tier.price}<span className="plan-price-period">/mo</span>
                        </div>
                        <ul className="plan-features-list" style={{ gap: '1.1rem', display: 'flex', flexDirection: 'column' }}>
                            {tier.features.map((feature, i) => (
                                <li key={i} className="plan-feature-item">
                                    <span className="plan-feature-check">✓</span> {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            className={`btn-subscribe ${tier.current ? 'btn-subscribe--ghost' : 'btn-subscribe--primary'}`}
                            style={{ marginTop: 'auto' }}
                            disabled={tier.current}
                        >
                            {tier.button}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
