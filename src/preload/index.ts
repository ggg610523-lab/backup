import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme: string) => ipcRenderer.send('set-theme', theme),

  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  getHomeDir: () => ipcRenderer.invoke('get-home-dir'),
  getDesktopDir: () => ipcRenderer.invoke('get-desktop-dir'),
  getDownloadsDir: () => ipcRenderer.invoke('get-downloads-dir'),
  getDocumentsDir: () => ipcRenderer.invoke('get-documents-dir'),
  getPicturesDir: () => ipcRenderer.invoke('get-pictures-dir'),
  getMusicDir: () => ipcRenderer.invoke('get-music-dir'),
  getVideosDir: () => ipcRenderer.invoke('get-videos-dir'),
  getRootDir: () => ipcRenderer.invoke('get-root-dir'),
  getDrives: () => ipcRenderer.invoke('get-drives'),

  createFolder: (dirPath: string, name: string) => ipcRenderer.invoke('create-folder', dirPath, name),
  rename: (oldPath: string, newName: string) => ipcRenderer.invoke('rename', oldPath, newName),
  deleteItems: (paths: string[]) => ipcRenderer.invoke('delete-items', paths),
  copyItems: (sources: string[], dest: string) => ipcRenderer.invoke('copy-items', sources, dest),
  moveItems: (sources: string[], dest: string) => ipcRenderer.invoke('move-items', sources, dest),

  searchFiles: (dirPath: string, query: string) => ipcRenderer.invoke('search-files', dirPath, query),
  getFileInfo: (filePath: string) => ipcRenderer.invoke('get-file-info', filePath),
  showItemInFolder: (itemPath: string) => ipcRenderer.invoke('show-item-in-folder', itemPath),
  openItem: (itemPath: string) => ipcRenderer.invoke('open-item', itemPath),
  openInTerminal: (dirPath: string) => ipcRenderer.invoke('open-in-terminal', dirPath),
  setWallpaper: (filePath: string) => ipcRenderer.invoke('set-wallpaper', filePath),
  getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),
  getPinnedFolders: () => ipcRenderer.invoke('get-pinned-folders'),

  // Icon APIs
  resolveIcon: (filePath: string, isDir: boolean) => ipcRenderer.invoke('resolve-icon', filePath, isDir),
  resolveIcons: (items: { path: string; isDir: boolean; name: string }[]) => ipcRenderer.invoke('resolve-icons', items),
  getSpecialIcons: () => ipcRenderer.invoke('get-special-icons'),

  // Progress events
  onCopyProgress: (callback: (data: any) => void) => {
    const handler = (_e: any, data: any) => callback(data);
    ipcRenderer.on('copy-progress', handler);
    return () => ipcRenderer.removeListener('copy-progress', handler);
  },
});
