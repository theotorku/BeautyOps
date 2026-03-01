'use client';

import { useState } from 'react';

interface Store {
  id: string;
  name: string;
  retailer: string;
  address: string;
  lastVisit: string;
  status: 'visited' | 'overdue' | 'scheduled' | 'new';
  performance: 'up' | 'down' | 'flat';
  x: number;
  y: number;
}

const sampleStores: Store[] = [
  { id: '1', name: 'Sephora Times Square', retailer: 'Sephora', address: '1535 Broadway, NYC', lastVisit: '2 days ago', status: 'visited', performance: 'up', x: 62, y: 28 },
  { id: '2', name: 'Ulta Beauty - Region 4', retailer: 'Ulta', address: '267 W 34th St, NYC', lastVisit: '1 week ago', status: 'overdue', performance: 'down', x: 55, y: 35 },
  { id: '3', name: 'Bloomingdales SoHo', retailer: 'Bloomingdales', address: '504 Broadway, NYC', lastVisit: 'Scheduled for Tomorrow', status: 'scheduled', performance: 'flat', x: 58, y: 48 },
  { id: '4', name: 'Nordstrom Flagship', retailer: 'Nordstrom', address: '225 W 57th St, NYC', lastVisit: '3 days ago', status: 'visited', performance: 'up', x: 48, y: 22 },
  { id: '5', name: 'Sephora Downtown', retailer: 'Sephora', address: '555 Broadway, NYC', lastVisit: 'Never visited', status: 'new', performance: 'flat', x: 60, y: 55 },
  { id: '6', name: 'Ulta Beauty - Chelsea', retailer: 'Ulta', address: '100 W 23rd St, NYC', lastVisit: '5 days ago', status: 'visited', performance: 'up', x: 42, y: 42 },
  { id: '7', name: 'Macy\'s Herald Square', retailer: 'Macy\'s', address: '151 W 34th St, NYC', lastVisit: '2 weeks ago', status: 'overdue', performance: 'down', x: 50, y: 33 },
  { id: '8', name: 'Bergdorf Goodman', retailer: 'Bergdorf', address: '754 5th Ave, NYC', lastVisit: '4 days ago', status: 'visited', performance: 'up', x: 55, y: 18 },
];

const statusConfig = {
  visited: { color: '#84e5c0', label: 'Recently Visited', icon: '✓' },
  overdue: { color: '#e58484', label: 'Overdue', icon: '!' },
  scheduled: { color: '#84b9e5', label: 'Scheduled', icon: '◷' },
  new: { color: '#e5d484', label: 'New Door', icon: '★' },
};

export default function TerritoryPage() {
  const [selected, setSelected] = useState<Store | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? sampleStores : sampleStores.filter(s => s.status === filter);
  const stats = {
    total: sampleStores.length,
    visited: sampleStores.filter(s => s.status === 'visited').length,
    overdue: sampleStores.filter(s => s.status === 'overdue').length,
    scheduled: sampleStores.filter(s => s.status === 'scheduled').length,
  };

  return (
    <div className="page-fade-in">
      <h1>Territory Map</h1>
      <p className="page-subtitle">Visualize your territory, track visit coverage, and plan routes.</p>

      {/* Stats Bar */}
      <div className="territory-stats">
        <div className="territory-stat">
          <span className="territory-stat-value">{stats.total}</span>
          <span className="territory-stat-label">Total Doors</span>
        </div>
        <div className="territory-stat">
          <span className="territory-stat-value" style={{ color: '#84e5c0' }}>{stats.visited}</span>
          <span className="territory-stat-label">Visited</span>
        </div>
        <div className="territory-stat">
          <span className="territory-stat-value" style={{ color: '#e58484' }}>{stats.overdue}</span>
          <span className="territory-stat-label">Overdue</span>
        </div>
        <div className="territory-stat">
          <span className="territory-stat-value" style={{ color: '#84b9e5' }}>{stats.scheduled}</span>
          <span className="territory-stat-label">Scheduled</span>
        </div>
      </div>

      {/* Filters */}
      <div className="templates-filters" style={{ marginBottom: '1rem' }}>
        {['all', 'visited', 'overdue', 'scheduled', 'new'].map(s => (
          <button
            key={s}
            className={`templates-filter-btn ${filter === s ? 'templates-filter-btn--active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All Stores' : statusConfig[s as keyof typeof statusConfig].label}
          </button>
        ))}
      </div>

      <div className="territory-layout">
        {/* Map Area */}
        <div className="card territory-map">
          <div className="territory-grid">
            {/* Grid lines */}
            {[20, 40, 60, 80].map(p => (
              <div key={`h${p}`} className="territory-gridline territory-gridline--h" style={{ top: `${p}%` }} />
            ))}
            {[20, 40, 60, 80].map(p => (
              <div key={`v${p}`} className="territory-gridline territory-gridline--v" style={{ left: `${p}%` }} />
            ))}

            {/* Store Pins */}
            {filtered.map(store => (
              <button
                key={store.id}
                className={`territory-pin ${selected?.id === store.id ? 'territory-pin--selected' : ''}`}
                style={{
                  left: `${store.x}%`,
                  top: `${store.y}%`,
                  '--pin-color': statusConfig[store.status].color,
                } as React.CSSProperties}
                onClick={() => setSelected(store)}
                title={store.name}
              >
                <span className="territory-pin-icon">{statusConfig[store.status].icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="territory-detail">
          {selected ? (
            <div className="card territory-detail-card">
              <div className="territory-detail-header">
                <span
                  className="territory-detail-status"
                  style={{ background: statusConfig[selected.status].color }}
                >
                  {statusConfig[selected.status].label}
                </span>
                <span className={`goals-trend goals-trend--${selected.performance}`}>
                  {selected.performance === 'up' ? '↗' : selected.performance === 'down' ? '↘' : '→'}
                </span>
              </div>
              <h3 className="territory-detail-name">{selected.name}</h3>
              <p className="territory-detail-retailer">{selected.retailer}</p>
              <p className="territory-detail-address">{selected.address}</p>
              <div className="territory-detail-visit">
                <span className="territory-detail-visit-label">Last Visit</span>
                <span>{selected.lastVisit}</span>
              </div>
              <div className="territory-detail-actions">
                <button onClick={() => window.location.href = '/visits'}>Log Visit</button>
                <button className="btn-ghost" onClick={() => window.location.href = '/briefing'}>View Briefing</button>
              </div>
            </div>
          ) : (
            <div className="card territory-detail-empty">
              <p>Select a store pin to view details</p>
            </div>
          )}

          {/* Store List */}
          <div className="territory-store-list">
            {filtered.map(store => (
              <div
                key={store.id}
                className={`territory-store-item ${selected?.id === store.id ? 'territory-store-item--active' : ''}`}
                onClick={() => setSelected(store)}
              >
                <span
                  className="territory-store-dot"
                  style={{ background: statusConfig[store.status].color }}
                />
                <div>
                  <p className="territory-store-name">{store.name}</p>
                  <p className="territory-store-meta">{store.lastVisit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
