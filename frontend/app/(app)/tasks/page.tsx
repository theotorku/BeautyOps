export default function TasksPage() {
    const tasks = [
        { id: 1, title: 'Follow up with Sephora Times Square', due: 'Today', status: 'Priority' },
        { id: 2, title: 'Analyze Ulta Q4 Sales', due: 'Tomorrow', status: 'Pending' },
        { id: 3, title: 'Schedule Training Visit - Bloomingdales', due: 'Friday', status: 'Upcoming' },
    ];

    return (
        <div className="page-container--narrow">
            <h1>Task Management</h1>
            <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Your AI-prioritized task engine.</p>

            <div className="card">
                <div className="tasks-list">
                    {tasks.map(task => (
                        <div key={task.id} className="task-row">
                            <div>
                                <p className="task-title">{task.title}</p>
                                <p className="task-due">Due: {task.due}</p>
                            </div>
                            <span className={`task-status-badge ${task.status === 'Priority' ? 'task-status-badge--priority' : 'task-status-badge--default'}`}>
                                {task.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
