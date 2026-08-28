import React, { useState, useEffect, useCallback } from 'react';
import { TabBar } from './components/TabBar';
import { NavigationPane } from './components/NavigationPane';
import { AddressBar } from './components/AddressBar';
import { ToolBar } from './components/ToolBar';
import { FileView } from './components/FileView';
import { ContextMenu } from './components/ContextMenu';
import { StatusBar } from './components/StatusBar';
import { HomeView } from './components/HomeView';
import { CopyProgress } from './components/CopyProgress';
import { useTheme } from './hooks/useTheme';
import { useFileSystem } from './hooks/useFileSystem';
import { FileItem } from './types';
import './theme.css';

export function App() {
  const { theme, themeMode, setTheme } = useTheme();
  const fs = useFileSystem();
  const [ctx, setCtx] = useState<{ visible: boolean; x: number; y: number; items: any[] }>({
    visible: false, x: 0, y: 0, items: [],
  });
  const [showHome, setShowHome] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fs.createTab(); }, []);

  const activeTab = fs.getActiveTab();

  useEffect(() => {
    if (activeTab) { fs.loadTabFiles(activeTab.id); setShowHome(false); }
  }, [activeTab?.id]);

  const nav = useCallback((path: string) => {
    if (activeTab) { fs.navigateTo(activeTab.id, path); setShowHome(false); setSidebarOpen(false); }
  }, [activeTab]);

  const back = useCallback(() => { if (activeTab) fs.goBack(activeTab.id); }, [activeTab]);
  const fwd = useCallback(() => { if (activeTab) fs.goForward(activeTab.id); }, [activeTab]);
  const up = useCallback(() => { if (activeTab) fs.goUp(activeTab.id); }, [activeTab]);
  const goHome = useCallback(() => { setShowHome(true); }, []);

  const newFolder = useCallback(async () => {
    let name = 'New Folder', c = 1;
    while (fs.files.some(f => f.name === name)) name = `New Folder (${c++})`;
    await fs.createNewFolder(name);
  }, [fs.files]);

  const showCtx = useCallback((e: React.MouseEvent, item: FileItem | null) => {
    e.preventDefault();
    e.stopPropagation();
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.svg', '.heic', '.heif'];
    const isImage = item && !item.isDirectory && imageExts.some(ext => item.name.toLowerCase().endsWith(ext));
    const items = item ? [
      { label: 'Open', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>, action: () => { if (item.isDirectory) nav(item.path); else window.api.openItem(item.path); } },
      { divider: true },
      { label: 'Cut', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>, action: () => { fs.toggleFileSelection(item.path, false); fs.cutFiles(); } },
      { label: 'Copy', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>, action: () => { fs.toggleFileSelection(item.path, false); fs.copyFiles(); } },
      { divider: true },
      ...(isImage ? [
        { label: 'Set as desktop background', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, action: async () => {
          const result = await window.api.setWallpaper(item.path);
          if (!result.success) console.error('Failed to set wallpaper:', result.error);
        }},
        { divider: true },
      ] : []),
      { label: 'Open in Terminal', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>, action: () => {
        const dir = item.isDirectory ? item.path : item.path.replace(/\/[^/]+$/, '');
        window.api.openInTerminal(dir);
      }},
      { divider: true },
      { label: 'Rename', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>, action: () => {
        const newName = prompt('Enter new name:', item.name);
        if (newName && newName !== item.name) fs.renameFile(item.path, newName);
      }},
      { label: 'Delete', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>, action: () => { fs.toggleFileSelection(item.path, false); fs.deleteFiles(); } },
      { divider: true },
      { label: 'Properties', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>, action: () => window.api.openItem(item.path) },
    ] : [
      { label: 'New Folder', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>, action: newFolder },
      { divider: true },
      { label: 'Paste', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>, action: () => fs.pasteFiles(), disabled: !fs.clipboard },
      { divider: true },
      { label: 'Select All', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, action: () => fs.selectAll() },
      { divider: true },
      { label: 'Refresh', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>, action: () => fs.refreshCurrentDir() },
      { divider: true },
      { label: 'Open in Terminal', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>, action: () => {
        window.api.openInTerminal(activeTab?.path || '/');
      }},
    ];
    setCtx({ visible: true, x: e.clientX, y: e.clientY, items });
  }, [fs, nav, newFolder, activeTab]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'c') { e.preventDefault(); fs.copyFiles(); }
      if (mod && e.key === 'x') { e.preventDefault(); fs.cutFiles(); }
      if (mod && e.key === 'v') { e.preventDefault(); fs.pasteFiles(); }
      if (e.key === 'Delete') fs.deleteFiles();
      if (mod && e.key === 'n') { e.preventDefault(); newFolder(); }
      if (mod && e.key === 't') { e.preventDefault(); fs.createTab(); }
      if (mod && e.key === 'w') { e.preventDefault(); if (activeTab) fs.closeTab(activeTab.id); }
      if (e.key === 'F5') { e.preventDefault(); fs.refreshCurrentDir(); }
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); back(); }
      if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); fwd(); }
      if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); up(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [fs, activeTab, back, fwd, up, newFolder]);

  return (
    <div className="app-container">
      <TabBar tabs={fs.tabs} activeTabId={fs.activeTabId}
        onTabClick={(id) => { fs.setActiveTabId(id); setShowHome(false); }}
        onCloseTab={(id) => fs.closeTab(id)}
        onNewTab={() => fs.createTab()}
        themeMode={themeMode}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onToggleSidebar={() => setSidebarOpen(p => !p)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)} />
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <NavigationPane onNavigate={(p) => { if (p === 'home') setShowHome(true); else nav(p); }}
            currentPath={activeTab?.path || ''} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <AddressBar path={activeTab?.path || ''} onNavigate={nav}
            onGoBack={back} onGoForward={fwd} onGoUp={up} onGoHome={goHome}
            canGoBack={activeTab ? activeTab.historyIndex > 0 : false}
            canGoForward={activeTab ? activeTab.historyIndex < activeTab.history.length - 1 : false}
            onSearch={fs.search} />
          <ToolBar viewMode={fs.viewMode} onViewModeChange={fs.setViewMode}
            onNewFolder={newFolder} onCut={fs.cutFiles} onCopy={fs.copyFiles}
            onPaste={fs.pasteFiles} onDelete={fs.deleteFiles} onRefresh={fs.refreshCurrentDir}
            onOpenTerminal={() => window.api.openInTerminal(activeTab?.path || '/')}
            onSort={fs.sortFiles} sortField={fs.sortField} sortOrder={fs.sortOrder}
            hasSelection={fs.selectedFiles.size > 0} hasClipboard={!!fs.clipboard} />
          {showHome ? (
            <HomeView onNavigate={nav} />
          ) : (
            <FileView files={fs.getSortedFiles()} loading={fs.loading} viewMode={fs.viewMode}
              selectedFiles={fs.selectedFiles} onSelect={fs.toggleFileSelection}
              onSelectAll={fs.selectAll} onClearSelection={fs.clearSelection}
              onOpen={(p, isDir) => { if (isDir) nav(p); else window.api.openItem(p); }}
              onRename={fs.renameFile} onContextMenu={showCtx} isSearching={fs.isSearching}
              animKey={fs.animKey} />
          )}
          <StatusBar files={fs.getSortedFiles()} selectedFiles={fs.selectedFiles}
            currentPath={activeTab?.path || ''} isSearching={fs.isSearching} searchQuery="" />
        </div>
      </div>
      <ContextMenu visible={ctx.visible} x={ctx.x} y={ctx.y} items={ctx.items}
        onClose={() => setCtx(p => ({ ...p, visible: false }))} />
      <CopyProgress />
    </div>
  );
}
