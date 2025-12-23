export default function TasksPage() {
    const tasks = [
        { id: 1, title: 'Follow up with Sephora Times Square', due: 'Today', status: 'Priority' },
        { id: 2, title: 'Analyze Ulta Q4 Sales', due: 'Tomorrow', status: 'Pending' },
        { id: 3, title: 'Schedule Training Visit - Bloomingdales', due: 'Friday', status: 'Upcoming' },
    ];

    return (
        <div style={{ maxWidth: '900px' }}>
            <h1>Task Management</h1>
            <p style={{ opacity: 0.6, marginBottom: '2rem' }}>Your AI-prioritized task engine.</p>

            <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tasks.map(task => (
                        <div key={task.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            borderBottom: '1px solid var(--glass-border)'
                        }}>
                            <div>
                                <p style={{ fontWeight: 600 }}>{task.title}</p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Due: {task.due}</p>
                            </div>
                            <span style={{
                                background: task.status === 'Priority' ? 'rgba(212, 165, 178, 0.2)' : 'var(--glass)',
                                color: task.status === 'Priority' ? 'var(--primary)' : 'inherit',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem'
                            }}>
                                {task.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
