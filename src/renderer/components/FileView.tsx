import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FileItem, ViewMode } from '../types';
import { SystemIcon } from './SystemIcon';

interface Props {
  files: FileItem[];
  loading: boolean;
  viewMode: ViewMode;
  selectedFiles: Set<string>;
  onSelect: (path: string, multi: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onOpen: (path: string, isDir: boolean) => void;
  onRename: (path: string, newName: string) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem | null) => void;
  isSearching: boolean;
  animKey: number;
}

function formatSize(bytes: number): string {
  if (!bytes) return '—';
  const u = ['B','KB','MB','GB','TB']; let i = 0, s = bytes;
  while (s >= 1024 && i < u.length - 1) { s /= 1024; i++; }
  return `${s.toFixed(i > 0 ? 1 : 0)} ${u[i]}`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

const GridItem = React.memo(({ item, iconSize, selected, onSelect, onDoubleClick, onContextMenu, renamingPath, renameInput }: {
  item: FileItem; iconSize: number; selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  renamingPath: string | null;
  renameInput: React.ReactNode;
}) => (
  <div onClick={onSelect} onDoubleClick={onDoubleClick} onContextMenu={onContextMenu}
    className={`file-item-grid ${selected ? 'selected' : ''}`}
    style={{ contain: 'layout style' }}>
    <SystemIcon path={item.path} isDir={item.isDirectory} name={item.name} size={iconSize} iconPath={item.icon} />
    {renamingPath === item.path ? renameInput : (
      <span style={{ fontSize: iconSize >= 64 ? 12 : 11, textAlign: 'center', maxWidth: '100%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', lineHeight: '1.35' }}>{item.name}</span>
    )}
  </div>
), (prev, next) => prev.item.path === next.item.path && prev.selected === next.selected && prev.renamingPath === next.renamingPath && prev.iconSize === next.iconSize);

const RowItem = React.memo(({ item, selected, onSelect, onDoubleClick, onContextMenu, renamingPath, renameInput, style }: {
  item: FileItem; selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  renamingPath: string | null;
  renameInput: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div onClick={onSelect} onDoubleClick={onDoubleClick} onContextMenu={onContextMenu}
    className={`file-item-row ${selected ? 'selected' : ''}`}
    style={{ ...style, contain: 'layout style' }}>
    <SystemIcon path={item.path} isDir={item.isDirectory} name={item.name} size={18} iconPath={item.icon} />
    {renamingPath === item.path ? <div style={{ flex: 1 }}>{renameInput}</div> : (
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontSize: 12.5 }}>{item.name}</span>
    )}
  </div>
), (prev, next) => prev.item.path === next.item.path && prev.selected === next.selected && prev.renamingPath === next.renamingPath);

export function FileView({ files, loading, viewMode, selectedFiles, onSelect, onSelectAll, onClearSelection, onOpen, onRename, onContextMenu, isSearching, animKey }: Props) {
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevAnimKeyRef = useRef(animKey);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (animKey !== prevAnimKeyRef.current) {
      prevAnimKeyRef.current = animKey;
      setShouldAnimate(true);
      const t = setTimeout(() => setShouldAnimate(false), 400);
      return () => clearTimeout(t);
    }
  }, [animKey]);

  useEffect(() => {
    if (renamingPath && renameRef.current) {
      renameRef.current.focus();
      const dotIdx = renameValue.lastIndexOf('.');
      renameRef.current.setSelectionRange(0, dotIdx > 0 ? dotIdx : renameValue.length);
    }
  }, [renamingPath]);

  const handleRenameSubmit = useCallback(() => {
    if (renamingPath && renameValue.trim()) onRename(renamingPath, renameValue.trim());
    setRenamingPath(null);
  }, [renamingPath, renameValue, onRename]);

  const startRename = useCallback((item: FileItem) => {
    setRenamingPath(item.path);
    setRenameValue(item.name);
  }, []);

  const handleDoubleClick = useCallback((item: FileItem) => {
    if (item.isDirectory) onOpen(item.path, true);
    else window.api.openItem(item.path);
  }, [onOpen]);

  const handleBgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.bg === 'true') onClearSelection();
  };

  const handleBgContextMenu = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.bg === 'true') onContextMenu(e, null);
  };

  const renameInput = useMemo(() => (
    <input ref={renameRef} value={renameValue} onChange={e => setRenameValue(e.target.value)}
      onBlur={handleRenameSubmit}
      onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setRenamingPath(null); }}
      onClick={e => e.stopPropagation()}
      autoFocus
      style={{
        width: '100%', padding: '3px 10px', border: '1px solid var(--border-focus)',
        borderRadius: 'var(--radius-sm)', outline: 'none', background: 'var(--bg-primary)',
        color: 'var(--text-primary)', fontSize: 12.5,
        boxShadow: '0 0 0 3px rgba(26,115,232,0.12)',
      }} />
  ), [renameValue, handleRenameSubmit]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
        <div style={{
          width: 32, height: 32, border: '3px solid var(--border-primary)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ color: 'var(--text-tertiary)', fontSize: 12.5, fontWeight: 400 }}>Loading...</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div data-bg="true" onClick={handleBgClick} onContextMenu={handleBgContextMenu} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: 'var(--text-tertiary)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 'var(--radius-xl)',
          background: 'var(--accent-gradient-soft)',
          border: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, boxShadow: 'var(--shadow-sm)',
          color: 'var(--accent)',
        }}>
          {isSearching ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          )}
        </div>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{isSearching ? 'No results found' : 'This folder is empty'}</span>
        {!isSearching && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Drop files here or create a new folder</span>}
      </div>
    );
  }

  const animClass = shouldAnimate ? 'stagger-children' : '';

  const renderDetailsView = () => (
    <div style={{ width: '100%' }}>
      <div className="details-header">
        <span>Name</span><span>Date Modified</span><span>Size</span><span>Perms</span>
      </div>
      <div className={animClass}>
        {files.map(item => (
          <RowItem key={item.path} item={item} selected={selectedFiles.has(item.path)}
            onSelect={e => { e.stopPropagation(); onSelect(item.path, e.ctrlKey || e.metaKey); }}
            onDoubleClick={() => handleDoubleClick(item)}
            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onSelect(item.path, false); onContextMenu(e, item); }}
            renamingPath={renamingPath} renameInput={renameInput}
            style={{ gridTemplateColumns: '1fr 140px 100px 80px', display: 'grid' }}
          />
        ))}
      </div>
    </div>
  );

  const renderGridView = (iconSize: number) => {
    const colW = iconSize >= 64 ? Math.max(iconSize + 60, 120) : Math.max(iconSize + 44, 90);
    return (
      <div className={animClass} style={{
        display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${colW}px, 1fr))`,
        gap: 4, padding: 12, alignContent: 'start',
      }}>
        {files.map(item => (
          <GridItem key={item.path} item={item} iconSize={iconSize} selected={selectedFiles.has(item.path)}
            onSelect={e => { e.stopPropagation(); onSelect(item.path, e.ctrlKey || e.metaKey); }}
            onDoubleClick={() => handleDoubleClick(item)}
            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onSelect(item.path, false); onContextMenu(e, item); }}
            renamingPath={renamingPath} renameInput={renameInput}
          />
        ))}
      </div>
    );
  };

  const renderListView = () => (
    <div className={animClass} style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '6px 10px' }}>
      {files.map(item => (
        <RowItem key={item.path} item={item} selected={selectedFiles.has(item.path)}
          onSelect={e => { e.stopPropagation(); onSelect(item.path, e.ctrlKey || e.metaKey); }}
          onDoubleClick={() => handleDoubleClick(item)}
          onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onSelect(item.path, false); onContextMenu(e, item); }}
          renamingPath={renamingPath} renameInput={renameInput}
        />
      ))}
    </div>
  );

  return (
    <div ref={containerRef} data-bg="true" onClick={handleBgClick} onContextMenu={handleBgContextMenu}
      onKeyDown={e => {
        if (e.key === 'a' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onSelectAll(); }
        if (e.key === 'F2' && selectedFiles.size === 1) {
          const item = files.find(f => f.path === Array.from(selectedFiles)[0]);
          if (item) startRename(item);
        }
      }}
      tabIndex={0} style={{ flex: 1, overflow: 'auto', outline: 'none' }}>
      {viewMode === 'details' ? renderDetailsView() :
       viewMode === 'list' ? renderListView() :
       viewMode === 'grid-lg' ? renderGridView(64) :
       viewMode === 'grid-sm' ? renderGridView(32) :
       renderGridView(48)}
    </div>
  );
}
