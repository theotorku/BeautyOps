export default function PricingPage() {
    const tiers = [
        {
            name: 'Solo AE',
            price: '$49',
            description: 'Perfect for independent beauty representatives.',
            features: [
                'Unlimited Store Visit Reports',
                'Basic Task Management',
                '10 AI POS Analysis Credits/mo',
                'Basic Calendar Sync (Personal)'
            ],
            button: 'Current Plan',
            current: true
        },
        {
            name: 'Pro AE',
            price: '$149',
            description: 'The complete toolkit for high-performing teams.',
            features: [
                'Everything in Solo',
                'Unlimited AI POS Analysis',
                'Proactive AI Briefing Engine',
                'Smart Calendar Time-Blocking',
                'Training & Content Generators',
                'Team Collaboration Dashboard'
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
            button: 'Contact Sales',
            current: false
        }
    ];

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Choose Your Plan</h1>
            <p style={{ textAlign: 'center', opacity: 0.6, marginBottom: '3rem' }}>
                Scale your field operations with the power of AI.
            </p>

            <div className="grid">
                {tiers.map((tier, idx) => (
                    <div key={idx} className={`card ${tier.popular ? 'glass-morphism' : ''}`} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        border: tier.popular ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                        position: 'relative'
                    }}>
                        {tier.popular && (
                            <span style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '20px',
                                background: 'var(--primary)',
                                color: '#000',
                                padding: '0.2rem 0.8rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}>
                                MOST POPULAR
                            </span>
                        )}
                        <div>
                            <h2 style={{ fontSize: '1.5rem' }}>{tier.name}</h2>
                            <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>{tier.description}</p>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                            {tier.price}<span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.5 }}>/mo</span>
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {tier.features.map((feature, i) => (
                                <li key={i} style={{ fontSize: '0.9rem', opacity: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: 'var(--primary)' }}>✓</span> {feature}
                                </li>
                            ))}
                        </ul>
                        <button style={{
                            marginTop: 'auto',
                            background: tier.current ? 'var(--glass)' : 'var(--primary)',
                            color: tier.current ? 'var(--foreground)' : '#000',
                            border: tier.current ? '1px solid var(--glass-border)' : 'none'
                        }}>
                            {tier.button}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
