import React from 'react';
import { Tab } from '../types';

interface Props {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  themeMode: string;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export function TabBar({ tabs, activeTabId, onTabClick, onCloseTab, onNewTab, themeMode, onToggleTheme, onToggleSidebar }: Props) {
  return (
    <div className="titlebar" style={{
      display: 'flex', alignItems: 'flex-end', height: 'var(--tabbar-h)',
      background: 'var(--bg-primary)', paddingLeft: 0, paddingRight: 0, gap: 0,
      paddingBottom: 0,
    }}>
      <button className="hamburger-btn" onClick={onToggleSidebar} title="Menu"
        style={{ display: 'flex', marginLeft: 6, marginBottom: 4 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1, gap: 2, overflow: 'hidden', paddingLeft: 4 }}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
          >
            <span className="tab-label">{tab.title}</span>
            <button
              className="tab-close"
              onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
            >✕</button>
          </div>
        ))}
        <button className="tab-add" onClick={onNewTab} title="New tab (Ctrl+T)">+</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 2, paddingRight: 6, paddingBottom: 3 }}>
        <button
          onClick={onToggleTheme}
          title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}
          className="nav-btn"
          style={{ width: 28, height: 26, fontSize: 13 }}
        >
          {themeMode === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        <button className="win-btn" onClick={() => window.api.windowMinimize()} title="Minimize">
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1"/></svg>
        </button>
        <button className="win-btn" onClick={() => window.api.windowMaximize()} title="Maximize">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9" rx="1.5"/>
          </svg>
        </button>
        <button className="win-btn close" onClick={() => window.api.windowClose()} title="Close">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M1 0L0 1L4 5L0 9L1 10L5 6L9 10L10 9L6 5L10 1L9 0L5 4Z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
