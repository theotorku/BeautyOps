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
        <div style={{ maxWidth: '1200px', animation: 'fadeIn 0.8s ease-out' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Investment Tiers</h1>
            <p style={{ textAlign: 'center', opacity: 0.6, marginBottom: '4rem', fontSize: '1.1rem' }}>
                Choose the intelligence level that matches your field operations.
            </p>

            <div className="grid">
                {tiers.map((tier, idx) => (
                    <div key={idx} className="card" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem',
                        border: tier.popular ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                        position: 'relative',
                        padding: '2.5rem',
                        animation: 'slideUp 0.6s ease-out both',
                        animationDelay: `${idx * 0.15}s`,
                        background: tier.popular ? 'linear-gradient(180deg, rgba(229, 185, 196, 0.05) 0%, rgba(15, 15, 19, 1) 100%)' : 'var(--secondary)'
                    }}>
                        {tier.popular && (
                            <span style={{
                                position: 'absolute',
                                top: '-14px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'var(--primary-gradient)',
                                color: '#000',
                                padding: '0.4rem 1.25rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '900',
                                boxShadow: '0 4px 12px rgba(229, 185, 196, 0.4)',
                                letterSpacing: '1px'
                            }}>
                                RECOMMENDED
                            </span>
                        )}
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{tier.name}</h2>
                            <p style={{ opacity: 0.5, fontSize: '0.95rem', marginTop: '0.75rem' }}>{tier.description}</p>
                        </div>
                        <div style={{ fontSize: '3.5rem', fontWeight: '900', background: tier.popular ? 'var(--primary-gradient)' : 'none', WebkitBackgroundClip: tier.popular ? 'text' : 'none', WebkitTextFillColor: tier.popular ? 'transparent' : 'inherit' }}>
                            {tier.price}<span style={{ fontSize: '1.1rem', fontWeight: '400', opacity: 0.4, WebkitTextFillColor: 'var(--foreground)' }}>/mo</span>
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            {tier.features.map((feature, i) => (
                                <li key={i} style={{ fontSize: '1rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> {feature}
                                </li>
                            ))}
                        </ul>
                        <button style={{
                            marginTop: 'auto',
                            background: tier.current ? 'rgba(255,255,255,0.03)' : 'var(--primary-gradient)',
                            color: tier.current ? 'var(--foreground)' : '#000',
                            border: tier.current ? '1px solid var(--glass-border)' : 'none',
                            padding: '1.1rem',
                            fontSize: '1rem',
                            boxShadow: tier.current ? 'none' : '0 8px 24px rgba(229, 185, 196, 0.3)'
                        }} disabled={tier.current}>
                            {tier.button}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
