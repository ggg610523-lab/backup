import { app, BrowserWindow, ipcMain, shell, nativeTheme } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execSync } from 'child_process';

let mainWindow: BrowserWindow | null = null;

// ── Icon Theme (Reversal) ───────────────────────────────────────────────────
const reversalDir = path.join(__dirname, '../renderer/reversal-icons');
const fallbackDirs = [
  '/usr/share/icons/Adwaita',
  '/usr/share/icons/Pop',
  '/usr/share/icons/hicolor',
];
const categories = ['places', 'mimes', 'devices', 'apps', 'actions', 'categories', 'status', 'emblems'];

// Flat index: iconName → absolute path, built once at startup
const iconIndex = new Map<string, string>();

function buildIconIndex(): void {
  const dirs = [reversalDir, ...fallbackDirs];
  const sizes = ['scalable', '48x48', '48', '32', '22'];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const cat of categories) {
      for (const size of sizes) {
        const dirPath = path.join(dir, cat, size);
        if (!fs.existsSync(dirPath)) continue;
        try {
          for (const file of fs.readdirSync(dirPath)) {
            const ext = path.extname(file);
            if (ext !== '.svg' && ext !== '.png') continue;
            const name = path.basename(file, ext);
            if (!iconIndex.has(name)) {
              iconIndex.set(name, path.join(dirPath, file));
            }
          }
        } catch {}
      }
    }
  }
  console.log(`[icons] indexed ${iconIndex.size} icons`);
}

buildIconIndex();

function resolveIcon(iconName: string): string | null {
  return iconIndex.get(iconName) || null;
}

// ── MIME → Icon mapping ──────────────────────────────────────────────────────
const mimeToIcon: Record<string, string> = {
  'inode/directory': 'folder',
  'inode/symlink': 'inode-symlink',
  'text/plain': 'text-x-generic',
  'text/html': 'text-html',
  'text/x-python': 'text-x-script',
  'text/x-script': 'text-x-script',
  'text/x-c': 'text-x-script',
  'text/x-c++src': 'text-x-script',
  'text/x-java': 'text-x-script',
  'text/x-shellscript': 'text-x-script',
  'text/x-markdown': 'text-x-generic',
  'text/x-log': 'text-x-generic',
  'text/x-diff': 'text-x-generic',
  'text/css': 'text-x-generic',
  'text/csv': 'x-office-spreadsheet',
  'text/xml': 'text-x-generic',
  'application/json': 'text-x-generic',
  'application/javascript': 'text-x-script',
  'application/xml': 'text-x-generic',
  'application/x-shellscript': 'text-x-script',
  'application/x-executable': 'application-x-executable',
  'application/x-sharedlib': 'application-x-sharedlib',
  'application/x-appimage': 'application-x-executable',
  'application/x-deb': 'package-x-generic',
  'application/x-rpm': 'package-x-generic',
  'application/x-archive': 'package-x-generic',
  'application/x-7z-compressed': 'package-x-generic',
  'application/x-rar': 'package-x-generic',
  'application/zip': 'application-zip',
  'application/gzip': 'application-x-tar',
  'application/x-tar': 'application-x-tar',
  'application/x-bzip2': 'application-x-tar',
  'application/x-xz': 'application-x-tar',
  'application/pdf': 'application-pdf',
  'application/msword': 'x-office-document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'x-office-document',
  'application/vnd.ms-excel': 'x-office-spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'x-office-spreadsheet',
  'application/vnd.ms-powerpoint': 'x-office-presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'x-office-presentation',
  'image/png': 'image-x-generic',
  'image/jpeg': 'image-x-generic',
  'image/gif': 'image-x-generic',
  'image/svg+xml': 'image-x-generic',
  'image/webp': 'image-x-generic',
  'image/bmp': 'image-x-generic',
  'image/tiff': 'image-x-generic',
  'image/x-icon': 'image-x-generic',
  'video/mp4': 'video-x-generic',
  'video/x-matroska': 'video-x-generic',
  'video/webm': 'video-x-generic',
  'video/x-msvideo': 'video-x-generic',
  'video/quicktime': 'video-x-generic',
  'audio/mpeg': 'audio-x-generic',
  'audio/x-flac': 'audio-x-generic',
  'audio/ogg': 'audio-x-generic',
  'audio/x-wav': 'audio-x-generic',
  'audio/mp4': 'audio-x-generic',
  'audio/x-aac': 'audio-x-generic',
  'audio/x-ms-wma': 'audio-x-generic',
  'font/ttf': 'font-x-generic',
  'font/otf': 'font-x-generic',
  'application/x-font-ttf': 'font-x-generic',
  'application/font-sfnt': 'font-x-generic',
  'application-x-generic': 'application-x-generic',
};

const extToMime: Record<string, string> = {
  '.txt': 'text/plain', '.md': 'text/plain', '.log': 'text/plain',
  '.html': 'text/html', '.htm': 'text/html', '.css': 'text/css',
  '.js': 'application/javascript', '.ts': 'text/x-script',
  '.tsx': 'text/x-script', '.jsx': 'text/x-script',
  '.py': 'text/x-python', '.rb': 'text/x-script',
  '.java': 'text/x-java', '.c': 'text/x-c', '.cpp': 'text/x-c++src',
  '.h': 'text/x-c', '.hpp': 'text/x-c++src', '.rs': 'text/x-script',
  '.go': 'text/x-script', '.php': 'text/x-script', '.sh': 'text/x-shellscript',
  '.bash': 'text/x-shellscript', '.zsh': 'text/x-shellscript',
  '.csv': 'text/csv', '.xml': 'text/xml', '.json': 'application/json',
  '.yaml': 'text/plain', '.yml': 'text/plain', '.toml': 'text/plain',
  '.ini': 'text/plain', '.conf': 'text/plain', '.cfg': 'text/plain',
  '.diff': 'text/x-diff', '.patch': 'text/x-diff',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.odt': 'x-office-document', '.ods': 'x-office-spreadsheet', '.odp': 'x-office-presentation',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.bmp': 'image/bmp', '.tiff': 'image/tiff', '.tif': 'image/tiff',
  '.ico': 'image/x-icon', '.heic': 'image/jpeg', '.heif': 'image/jpeg',
  '.mp4': 'video/mp4', '.mkv': 'video/x-matroska', '.webm': 'video/webm',
  '.avi': 'video/x-msvideo', '.mov': 'video/quicktime', '.flv': 'video/x-msvideo',
  '.wmv': 'video/x-msvideo', '.m4v': 'video/mp4',
  '.mp3': 'audio/mpeg', '.flac': 'audio/x-flac', '.ogg': 'audio/ogg',
  '.wav': 'audio/x-wav', '.m4a': 'audio/mp4', '.aac': 'audio/x-aac',
  '.wma': 'audio/x-ms-wma',
  '.zip': 'application/zip', '.tar': 'application/x-tar', '.gz': 'application/gzip',
  '.bz2': 'application/x-bzip2', '.xz': 'application/x-xz',
  '.7z': 'application/x-7z-compressed', '.rar': 'application/x-rar',
  '.deb': 'application/x-deb', '.rpm': 'application/x-rpm',
  '.AppImage': 'application/x-appimage', '.flatpak': 'application/x-archive',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/ttf', '.woff2': 'font/ttf',
  '.exe': 'application/x-executable', '.dll': 'application/x-sharedlib',
  '.so': 'application/x-sharedlib', '.bin': 'application/x-executable',
  '.lock': 'text/plain', '.env': 'text/plain',
  '.db': 'application-x-generic', '.sqlite': 'application-x-generic',
};

// ── Special folder icons (Reversal names) ────────────────────────────────────
const specialFolderIcons: Record<string, string> = {
  'home': 'user-home',
  'desktop': 'user-desktop',
  'documents': 'folder-documents',
  'downloads': 'folder-download',
  'pictures': 'folder-images',
  'music': 'folder-music',
  'videos': 'folder-videos',
  'trash': 'user-trash',
  'folder': 'folder',
  'web': 'web-browser',
};

// Folder name → icon name lookup (case-insensitive)
const folderNameMap = new Map<string, string>();
for (const [key, icon] of Object.entries(specialFolderIcons)) {
  folderNameMap.set(key.toLowerCase(), icon);
}

function getFolderIcon(name: string): string {
  const icon = folderNameMap.get(name.toLowerCase());
  if (icon) return icon;
  // Try common aliases
  const lower = name.toLowerCase();
  if (lower === 'templates') return 'folder-templates';
  if (lower === 'public') return 'folder-public';
  if (lower === 'projects') return 'folder-projects';
  if (lower === 'downloads') return 'folder-download';
  if (lower === 'tmp' || lower === 'temp') return 'folder-temp';
  return 'folder';
}

function getIconForFile(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  // Extension lookup
  const mime = extToMime[ext];
  if (mime) {
    const icon = mimeToIcon[mime];
    if (icon) return icon;
  }

  // Fallback: try `file --mime-type`
  try {
    const result = execSync(`file --mime-type -b "${filePath}" 2>/dev/null`, { timeout: 2000 }).toString().trim();
    const icon = mimeToIcon[result];
    if (icon) return icon;
  } catch {}

  return 'text-x-generic';
}

// ── Window ───────────────────────────────────────────────────────────────────
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    frame: false,
    titleBarStyle: 'hidden',
    transparent: true,
    backgroundColor: '#00000000',
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ── IPC: Window controls ─────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

// ── IPC: Theme ───────────────────────────────────────────────────────────────
ipcMain.handle('get-theme', () => nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
ipcMain.on('set-theme', (_e, theme: string) => {
  nativeTheme.themeSource = theme === 'dark' ? 'dark' : 'light';
});

// ── IPC: Icons ───────────────────────────────────────────────────────────────
ipcMain.handle('resolve-icon', (_e, filePath: string, isDir: boolean) => {
  if (isDir) {
    const name = path.basename(filePath);
    return resolveIcon(getFolderIcon(name));
  }
  return resolveIcon(getIconForFile(filePath));
});

ipcMain.handle('resolve-icons', (_e, items: { path: string; isDir: boolean; name: string }[]) => {
  const result: Record<string, string | null> = {};
  for (const item of items) {
    if (item.isDir) {
      result[item.path] = resolveIcon(getFolderIcon(item.name));
    } else {
      result[item.path] = resolveIcon(getIconForFile(item.path));
    }
  }
  return result;
});

ipcMain.handle('get-special-icons', () => {
  const icons: Record<string, string | null> = {};
  for (const [key, iconName] of Object.entries(specialFolderIcons)) {
    icons[key] = resolveIcon(iconName);
  }
  icons['drive'] = resolveIcon('drive-harddisk') || resolveIcon('drive');
  icons['network'] = resolveIcon('network-server') || resolveIcon('network-workgroup');
  return icons;
});

// ── IPC: File system ─────────────────────────────────────────────────────────
ipcMain.handle('get-home-dir', () => os.homedir());

ipcMain.handle('read-directory', async (_e, dirPath: string) => {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const raw = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        try {
          const stats = await fs.promises.stat(fullPath);
          return {
            name: entry.name, path: fullPath,
            isDirectory: entry.isDirectory(), isFile: entry.isFile(),
            isSymlink: entry.isSymbolicLink(), size: stats.size,
            modified: stats.mtime.toISOString(),
            created: stats.birthtime.toISOString(),
            permissions: (stats.mode & 0o777).toString(8),
          };
        } catch {
          return {
            name: entry.name, path: fullPath,
            isDirectory: entry.isDirectory(), isFile: entry.isFile(),
            isSymlink: entry.isSymbolicLink(), size: 0,
            modified: '', created: '', permissions: '',
          };
        }
      })
    );
    // Batch-resolve icons in main process
    const files = raw.map(f => ({
      ...f,
      icon: f.isDirectory ? resolveIcon(getFolderIcon(f.name)) : resolveIcon(getIconForFile(f.path)),
    }));
    return { success: true, files };
  } catch (error: any) {
    return { success: false, error: error.message, files: [] };
  }
});

ipcMain.handle('get-drives', async () => {
  try {
    const mounts = await fs.promises.readFile('/proc/mounts', 'utf-8');
    const seen = new Set<string>();
    const drives: { name: string; path: string; total: number; free: number }[] = [];
    for (const line of mounts.split('\n')) {
      const parts = line.split(' ');
      const mp = parts[1];
      if (!mp || seen.has(mp)) continue;
      if (mp === '/' || mp.startsWith('/media') || mp.startsWith('/mnt') || mp.startsWith('/run/media')) {
        seen.add(mp);
        try {
          const st = await fs.promises.statfs(mp);
          drives.push({
            name: mp === '/' ? 'Root' : path.basename(mp) || mp,
            path: mp, total: st.blocks * st.bsize, free: st.bfree * st.bsize,
          });
        } catch {
          drives.push({
            name: mp === '/' ? 'Root' : path.basename(mp) || mp,
            path: mp, total: 0, free: 0,
          });
        }
      }
    }
    return drives;
  } catch {
    return [{ name: 'Root', path: '/', total: 0, free: 0 }];
  }
});

ipcMain.handle('create-folder', async (_e, dirPath: string, name: string) => {
  try {
    const newPath = path.join(dirPath, name);
    await fs.promises.mkdir(newPath, { recursive: true });
    return { success: true, path: newPath };
  } catch (error: any) { return { success: false, error: error.message }; }
});

ipcMain.handle('rename', async (_e, oldPath: string, newName: string) => {
  try {
    const newPath = path.join(path.dirname(oldPath), newName);
    await fs.promises.rename(oldPath, newPath);
    return { success: true, path: newPath };
  } catch (error: any) { return { success: false, error: error.message }; }
});

ipcMain.handle('delete-items', async (_e, paths: string[]) => {
  const results: { path: string; success: boolean; error?: string }[] = [];
  for (const p of paths) {
    try {
      const stats = await fs.promises.stat(p);
      if (stats.isDirectory()) await fs.promises.rm(p, { recursive: true, force: true });
      else await fs.promises.unlink(p);
      results.push({ path: p, success: true });
    } catch (error: any) { results.push({ path: p, success: false, error: error.message }); }
  }
  return results;
});

// ── File counting for progress ────────────────────────────────────────────────
async function countFilesRecursive(dirPath: string): Promise<{ files: number; bytes: number }> {
  let files = 0, bytes = 0;
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const sub = await countFilesRecursive(full);
        files += sub.files;
        bytes += sub.bytes;
      } else {
        files++;
        try { bytes += (await fs.promises.stat(full)).size; } catch {}
      }
    }
  } catch {}
  return { files, bytes };
}

async function copyDirRecursiveProgress(
  src: string, dest: string,
  webContents: Electron.WebContents,
  state: { filesDone: number; bytesDone: number; totalFiles: number; totalBytes: number; operation: string },
): Promise<void> {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDirRecursiveProgress(s, d, webContents, state);
    } else {
      try {
        const stats = await fs.promises.stat(s);
        await fs.promises.copyFile(s, d);
        state.filesDone++;
        state.bytesDone += stats.size;
      } catch {}
      webContents.send('copy-progress', {
        type: 'progress',
        currentFile: entry.name,
        currentPath: s,
        filesDone: state.filesDone,
        totalFiles: state.totalFiles,
        bytesDone: state.bytesDone,
        totalBytes: state.totalBytes,
        operation: state.operation,
      });
    }
  }
}

ipcMain.handle('copy-items', async (e, sources: string[], destination: string) => {
  const wc = e.sender;
  const results: { source: string; dest: string; success: boolean; error?: string }[] = [];

  // Count total files/bytes
  let totalFiles = 0, totalBytes = 0;
  for (const src of sources) {
    try {
      const stats = await fs.promises.stat(src);
      if (stats.isDirectory()) {
        const c = await countFilesRecursive(src);
        totalFiles += c.files;
        totalBytes += c.bytes;
      } else {
        totalFiles++;
        totalBytes += stats.size;
      }
    } catch {}
  }

  const state = { filesDone: 0, bytesDone: 0, totalFiles, totalBytes, operation: 'copy' };
  wc.send('copy-progress', { type: 'start', totalFiles, totalBytes, operation: 'copy', sources: sources.map(s => path.basename(s)) });

  for (const source of sources) {
    const destPath = path.join(destination, path.basename(source));
    try {
      const stats = await fs.promises.stat(source);
      if (stats.isDirectory()) {
        await copyDirRecursiveProgress(source, destPath, wc, state);
      } else {
        await fs.promises.copyFile(source, destPath);
        state.filesDone++;
        state.bytesDone += stats.size;
        wc.send('copy-progress', {
          type: 'progress',
          currentFile: path.basename(source),
          currentPath: source,
          filesDone: state.filesDone,
          totalFiles: state.totalFiles,
          bytesDone: state.bytesDone,
          totalBytes: state.totalBytes,
          operation: 'copy',
        });
      }
      results.push({ source, dest: destPath, success: true });
    } catch (error: any) { results.push({ source, dest: destPath, success: false, error: error.message }); }
  }

  wc.send('copy-progress', { type: 'complete' });
  return results;
});

ipcMain.handle('move-items', async (e, sources: string[], destination: string) => {
  const wc = e.sender;
  const results: { source: string; dest: string; success: boolean; error?: string }[] = [];

  let totalFiles = 0, totalBytes = 0;
  for (const src of sources) {
    try {
      const stats = await fs.promises.stat(src);
      if (stats.isDirectory()) {
        const c = await countFilesRecursive(src);
        totalFiles += c.files;
        totalBytes += c.bytes;
      } else {
        totalFiles++;
        totalBytes += stats.size;
      }
    } catch {}
  }

  const state = { filesDone: 0, bytesDone: 0, totalFiles, totalBytes, operation: 'move' };
  wc.send('copy-progress', { type: 'start', totalFiles, totalBytes, operation: 'move', sources: sources.map(s => path.basename(s)) });

  for (const source of sources) {
    const destPath = path.join(destination, path.basename(source));
    try {
      await fs.promises.rename(source, destPath);
      const stats = await fs.promises.stat(destPath).catch(() => null);
      state.filesDone++;
      if (stats) state.bytesDone += stats.size;
      wc.send('copy-progress', {
        type: 'progress',
        currentFile: path.basename(source),
        currentPath: source,
        filesDone: state.filesDone,
        totalFiles: state.totalFiles,
        bytesDone: state.bytesDone,
        totalBytes: state.totalBytes,
        operation: 'move',
      });
      results.push({ source, dest: destPath, success: true });
    } catch (error: any) { results.push({ source, dest: destPath, success: false, error: error.message }); }
  }

  wc.send('copy-progress', { type: 'complete' });
  return { success: true, results };
});

const MAX_SEARCH_RESULTS = 500;
const SEARCH_CONCURRENCY = 16;

ipcMain.handle('search-files', async (_e, dirPath: string, query: string) => {
  const results: any[] = [];
  const lowerQuery = query.toLowerCase();
  const queue: string[] = [dirPath];
  const maxDepth = 5;
  const visited = new Set<string>();
  visited.add(dirPath);

  while (queue.length > 0 && results.length < MAX_SEARCH_RESULTS) {
    const batch = queue.splice(0, SEARCH_CONCURRENCY);
    const entriesArr = await Promise.allSettled(
      batch.map(p => fs.promises.readdir(p, { withFileTypes: true }))
    );
    const subdirs: string[] = [];
    for (let i = 0; i < batch.length; i++) {
      if (entriesArr[i].status !== 'fulfilled') continue;
      for (const entry of (entriesArr[i] as PromiseFulfilledResult<fs.Dirent[]>).value) {
        if (results.length >= MAX_SEARCH_RESULTS) break;
        if (entry.name.toLowerCase().includes(lowerQuery)) {
          const fullPath = path.join(batch[i], entry.name);
          try {
            const stats = await fs.promises.stat(fullPath);
            results.push({
              name: entry.name, path: fullPath,
              isDirectory: entry.isDirectory(), isFile: entry.isFile(),
              isSymlink: entry.isSymbolicLink(), size: stats.size,
              modified: stats.mtime.toISOString(),
              created: stats.birthtime.toISOString(),
              permissions: (stats.mode & 0o777).toString(8),
              icon: entry.isDirectory()
                ? resolveIcon(getFolderIcon(entry.name))
                : resolveIcon(getIconForFile(fullPath)),
            });
          } catch {}
        }
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const subdir = path.join(batch[i], entry.name);
          if (!visited.has(subdir)) {
            visited.add(subdir);
            subdirs.push(subdir);
          }
        }
      }
    }
    queue.push(...subdirs);
  }
  return results;
});

ipcMain.handle('get-file-info', async (_e, filePath: string) => {
  try {
    const stats = await fs.promises.stat(filePath);
    return {
      name: path.basename(filePath), path: filePath,
      isDirectory: stats.isDirectory(), isFile: stats.isFile(),
      isSymlink: stats.isSymbolicLink(), size: stats.size,
      modified: stats.mtime.toISOString(),
      created: stats.birthtime.toISOString(),
      permissions: (stats.mode & 0o777).toString(8),
    };
  } catch { return null; }
});

ipcMain.handle('show-item-in-folder', (_e, p: string) => shell.showItemInFolder(p));
ipcMain.handle('open-item', (_e, p: string) => shell.openPath(p));
ipcMain.handle('open-in-terminal', (_e, dirPath: string) => {
  const terminals = [
    { cmd: 'konsole', args: ['--workdir', dirPath] },
    { cmd: 'kgterminal', args: ['--workdir', dirPath] },
    { cmd: 'gnome-terminal', args: [`--working-directory=${dirPath}`] },
    { cmd: 'alacritty', args: ['--working-directory', dirPath] },
    { cmd: 'kitty', args: ['--directory', dirPath] },
    { cmd: 'foot', args: [] },
    { cmd: 'xterm', args: [] },
  ];
  for (const t of terminals) {
    try {
      const bin = execSync(`which ${t.cmd} 2>/dev/null`).toString().trim();
      if (bin) {
        const { spawn } = require('child_process');
        spawn(t.cmd, t.args, { cwd: dirPath, detached: true, stdio: 'ignore' }).unref();
        return { success: true };
      }
    } catch {}
  }
  return { success: false, error: 'No terminal emulator found' };
});

// ── IPC: Set desktop wallpaper (KDE/XFCE/GNOME fallback) ────────────────────
ipcMain.handle('set-wallpaper', async (_e, filePath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Try KDE (xfconf-query)
    try {
      execSync(`xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitor0/workspace0/last-image --set "${filePath}" 2>/dev/null`, { timeout: 3000 });
      return { success: true };
    } catch {}

    // Try KDE Plasma 5/6 via qdbus
    try {
      execSync(`qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript "var allDesktops = desktops(); for (var i=0;i<allDesktops.length;i++) { allDesktops[i].wallpaperPlugin = 'org.kde.image'; allDesktops[i].currentConfigGroup = ['Wallpaper', 'org.kde.image', 'General']; allDesktops[i].writeConfig('Image', 'file://${filePath}'); }" 2>/dev/null`, { timeout: 3000 });
      return { success: true };
    } catch {}

    // Try GNOME
    try {
      execSync(`gsettings set org.gnome.desktop.background picture-uri "file://${filePath}" 2>/dev/null`, { timeout: 3000 });
      execSync(`gsettings set org.gnome.desktop.background picture-uri-dark "file://${filePath}" 2>/dev/null`, { timeout: 3000 });
      return { success: true };
    } catch {}

    // Try feh as universal fallback
    try {
      execSync(`feh --bg-fill "${filePath}" 2>/dev/null`, { timeout: 3000 });
      return { success: true };
    } catch {}

    return { success: false, error: 'No supported wallpaper setter found. Install feh, nitrogen, or use KDE/GNOME.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-recent-files', async () => {
  try {
    const homeDir = os.homedir();
    const dirs = ['Downloads', 'Documents', 'Desktop', 'Pictures', 'Music', 'Videos'];
    const recent: any[] = [];
    for (const dir of dirs) {
      try {
        const entries = await fs.promises.readdir(path.join(homeDir, dir), { withFileTypes: true });
        for (const entry of entries) {
          if (recent.length >= 20) break;
          if (!entry.isFile()) continue;
          const fullPath = path.join(homeDir, dir, entry.name);
          try {
            const stats = await fs.promises.stat(fullPath);
            recent.push({
              name: entry.name, path: fullPath,
              isDirectory: false, isFile: true, isSymlink: false,
              size: stats.size, modified: stats.mtime.toISOString(),
              created: stats.birthtime.toISOString(),
              permissions: (stats.mode & 0o777).toString(8),
              parentDir: dir,
              icon: resolveIcon(getIconForFile(fullPath)),
            });
          } catch {}
        }
      } catch {}
    }
    recent.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
    return recent.slice(0, 20);
  } catch { return []; }
});

ipcMain.handle('get-pinned-folders', () => {
  const homeDir = os.homedir();
  return [
    { name: 'Home', path: homeDir, icon: 'home' },
    { name: 'Desktop', path: path.join(homeDir, 'Desktop'), icon: 'desktop' },
    { name: 'Documents', path: path.join(homeDir, 'Documents'), icon: 'documents' },
    { name: 'Downloads', path: path.join(homeDir, 'Downloads'), icon: 'downloads' },
    { name: 'Pictures', path: path.join(homeDir, 'Pictures'), icon: 'pictures' },
    { name: 'Music', path: path.join(homeDir, 'Music'), icon: 'music' },
    { name: 'Videos', path: path.join(homeDir, 'Videos'), icon: 'videos' },
  ];
});
