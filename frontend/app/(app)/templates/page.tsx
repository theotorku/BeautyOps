'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  category: 'visit' | 'email' | 'training' | 'report';
  content: string;
  createdAt: string;
  usageCount: number;
}

const categoryLabels = {
  visit: '🎙️ Store Visit',
  email: '📧 Follow-up Email',
  training: '📖 Training Script',
  report: '📊 Report',
};

const sampleTemplates: Template[] = [
  {
    id: '1',
    name: 'Sephora Visit Standard',
    category: 'visit',
    content: 'Store: [Store Name]\nDate: [Date]\nBA Present: [Names]\n\nShelf Conditions:\n- [Brand] display: [Status]\n- Stock levels: [Good/Low/Out]\n\nCompetitor Activity:\n- [Observations]\n\nAction Items:\n- [ ] [Action]\n- [ ] [Action]\n\nFollow-up needed: [Yes/No]',
    createdAt: '2026-02-15',
    usageCount: 12,
  },
  {
    id: '2',
    name: 'Post-Visit Follow-up',
    category: 'email',
    content: 'Subject: Thank you for today\'s visit — [Store Name]\n\nHi [Manager Name],\n\nGreat connecting with your team today. Here are the key items we discussed:\n\n1. [Item]\n2. [Item]\n3. [Item]\n\nI\'ll follow up on [specific action] by [date].\n\nBest,\n[Your Name]',
    createdAt: '2026-02-20',
    usageCount: 8,
  },
  {
    id: '3',
    name: 'Product Launch Training',
    category: 'training',
    content: 'Product: [Product Name]\nLaunch Date: [Date]\n\nKey Selling Points:\n1. [Point]\n2. [Point]\n3. [Point]\n\nTarget Customer:\n[Description]\n\nCommon Objections:\n- "[Objection]" → [Response]\n\nDemo Steps:\n1. [Step]\n2. [Step]',
    createdAt: '2026-02-25',
    usageCount: 5,
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(sampleTemplates);
  const [filter, setFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Template['category']>('visit');
  const [newContent, setNewContent] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'all' ? templates : templates.filter(t => t.category === filter);

  const handleCreate = () => {
    if (!newName.trim() || !newContent.trim()) {
      toast.error('Please fill in template name and content');
      return;
    }
    const template: Template = {
      id: Date.now().toString(),
      name: newName,
      category: newCategory,
      content: newContent,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
    };
    setTemplates([template, ...templates]);
    setNewName('');
    setNewContent('');
    setShowCreate(false);
    toast.success('Template saved!');
  };

  const handleCopy = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    setTemplates(templates.map(t =>
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
    toast.success('Template copied to clipboard!');
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success('Template deleted');
  };

  return (
    <div className="page-fade-in">
      <div className="page-header">
        <div>
          <h1>Templates Library</h1>
          <p className="page-subtitle">Save and reuse your best templates across visits, emails, and training.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ New Template'}
        </button>
      </div>

      {/* Create Template Form */}
      {showCreate && (
        <div className="card card-animated templates-create" style={{ marginBottom: '2rem' }}>
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Create Template</h3>
          <div className="templates-form-row">
            <input
              type="text"
              placeholder="Template name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="templates-name-input"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Template['category'])}
            >
              <option value="visit">Store Visit</option>
              <option value="email">Follow-up Email</option>
              <option value="training">Training Script</option>
              <option value="report">Report</option>
            </select>
          </div>
          <textarea
            className="input-area"
            placeholder="Template content... Use [brackets] for placeholder fields."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <button onClick={handleCreate} style={{ marginTop: '0.75rem' }}>Save Template</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="templates-filters">
        {['all', 'visit', 'email', 'training', 'report'].map(cat => (
          <button
            key={cat}
            className={`templates-filter-btn ${filter === cat ? 'templates-filter-btn--active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All' : categoryLabels[cat as keyof typeof categoryLabels]}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="templates-list">
        {filtered.map(template => (
          <div key={template.id} className="card card-animated templates-card">
            <div className="templates-card-header" onClick={() => setExpanded(expanded === template.id ? null : template.id)}>
              <div>
                <span className="templates-category-badge">{categoryLabels[template.category]}</span>
                <h4 className="templates-card-name">{template.name}</h4>
                <p className="templates-card-meta">
                  Created {template.createdAt} · Used {template.usageCount} times
                </p>
              </div>
              <span className="templates-expand">{expanded === template.id ? '▲' : '▼'}</span>
            </div>
            {expanded === template.id && (
              <div className="templates-card-body">
                <pre className="templates-preview">{template.content}</pre>
                <div className="templates-actions">
                  <button onClick={() => handleCopy(template)}>Copy Template</button>
                  <button className="btn-ghost" onClick={() => handleDelete(template.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card templates-empty">
            <p>No templates in this category yet.</p>
            <button className="btn-ghost" onClick={() => setShowCreate(true)}>Create one</button>
          </div>
        )}
      </div>
    </div>
  );
}
