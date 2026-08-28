import React, { useState, useEffect } from 'react';
import { FileItem } from '../types';
import { SystemIcon } from './SystemIcon';

interface Props {
  onNavigate: (path: string) => void;
}

function fmt(b: number): string {
  if (!b) return '—';
  const u = ['B','KB','MB','GB','TB']; let i = 0, s = b;
  while (s >= 1024 && i < u.length - 1) { s /= 1024; i++; }
  return `${s.toFixed(i > 0 ? 1 : 0)} ${u[i]}`;
}

function relDate(iso: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeView({ onNavigate }: Props) {
  const [recent, setRecent] = useState<FileItem[]>([]);
  const [pinned, setPinned] = useState<{ name: string; path: string; icon: string }[]>([]);
  const [drives, setDrives] = useState<{ name: string; path: string; total: number; free: number }[]>([]);
  const [specialIcons, setSpecialIcons] = useState<Record<string, string | null>>({});

  useEffect(() => {
    window.api.getRecentFiles().then(setRecent);
    window.api.getPinnedFolders().then(setPinned);
    window.api.getDrives().then(setDrives);
    window.api.getSpecialIcons().then(setSpecialIcons);
  }, []);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px', maxWidth: 820, margin: '0 auto', width: '100%' }}>
      {/* Greeting */}
      <div className="anim-fade-in" style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: 'var(--text-primary)',
          marginBottom: 4, letterSpacing: '-0.03em', lineHeight: 1.2,
        }}>
          {greeting()}<span style={{
            background: 'var(--accent-gradient-vivid)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>.</span>
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', fontWeight: 400, marginTop: 2 }}>
          Here's what's on your machine
        </p>
      </div>

      {/* Quick Access */}
      <div className="anim-fade-in" style={{ marginBottom: 36, animationDelay: '40ms' }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 16, height: 16, borderRadius: 4,
            background: 'var(--accent-gradient)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: '#fff',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </span>
          Quick Access
        </div>
        <div className="stagger-children" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8,
        }}>
          {pinned.map(f => (
            <div key={f.path} onClick={() => onNavigate(f.path)} className="home-card">
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--accent-gradient-soft)',
                border: '1px solid var(--border-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <SystemIcon path={specialIcons[f.icon] || null} isDir={true} name={f.icon} size={24} iconPath={specialIcons[f.icon] || null} />
              </div>
              <span style={{
                fontSize: 13, fontWeight: 500, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{f.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Devices */}
      {drives.length > 0 && (
        <div className="anim-fade-in" style={{ marginBottom: 36, animationDelay: '80ms' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4,
              background: 'var(--accent-gradient)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: '#fff',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M14 12h4"/>
              </svg>
            </span>
            Devices
          </div>
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {drives.map(d => (
              <div key={d.path} onClick={() => onNavigate(d.path)} className="home-card">
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--accent-gradient-soft)',
                  border: '1px solid var(--border-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <SystemIcon path={specialIcons['drive'] || null} isDir={false} name="drive" size={30} iconPath={specialIcons['drive'] || null} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{d.name}</div>
                  {d.total > 0 && (
                    <>
                      <div className="usage-bar" style={{ marginTop: 8 }}>
                        <div className="usage-bar-fill" style={{ width: `${(d.total - d.free) / d.total * 100}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>
                        {fmt(d.total - d.free)} of {fmt(d.total)} used
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Files */}
      {recent.length > 0 && (
        <div className="anim-fade-in" style={{ animationDelay: '120ms' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4,
              background: 'var(--accent-gradient)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: '#fff',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </span>
            Recent Files
          </div>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column' }}>
              {recent.map(f => (
                <div key={f.path} onClick={() => onNavigate(f.path.replace(/\/[^/]+$/, ''))}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 18px', cursor: 'pointer',
                    transition: 'background 0.12s var(--ease-out)',
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', minWidth: 0 }}>
                    <SystemIcon path={f.path} isDir={false} name={f.name} size={18} iconPath={f.icon} />
                    <div style={{ overflow: 'hidden', minWidth: 0 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 500, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                      }}>{f.name}</span>
                      {f.parentDir && (
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>in {f.parentDir}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, marginLeft: 16 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{fmt(f.size)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 56, textAlign: 'right' }}>{relDate(f.modified)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
