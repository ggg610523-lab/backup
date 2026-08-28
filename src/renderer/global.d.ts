declare global {
  interface Window {
    api: {
      windowMinimize: () => void;
      windowMaximize: () => void;
      windowClose: () => void;
      getTheme: () => Promise<string>;
      setTheme: (theme: string) => void;
      readDirectory: (dirPath: string) => Promise<{ success: boolean; files: any[]; error?: string }>;
      getHomeDir: () => Promise<string>;
      getDesktopDir: () => Promise<string>;
      getDownloadsDir: () => Promise<string>;
      getDocumentsDir: () => Promise<string>;
      getPicturesDir: () => Promise<string>;
      getMusicDir: () => Promise<string>;
      getVideosDir: () => Promise<string>;
      getRootDir: () => Promise<string>;
      getDrives: () => Promise<{ name: string; path: string; total: number; free: number }[]>;
      createFolder: (dirPath: string, name: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      rename: (oldPath: string, newName: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      deleteItems: (paths: string[]) => Promise<{ path: string; success: boolean; error?: string }[]>;
      copyItems: (sources: string[], destination: string) => Promise<any>;
      moveItems: (sources: string[], destination: string) => Promise<any>;
      searchFiles: (dirPath: string, query: string) => Promise<any[]>;
      getFileInfo: (filePath: string) => Promise<any>;
      showItemInFolder: (itemPath: string) => void;
      openItem: (itemPath: string) => void;
      openInTerminal: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
      setWallpaper: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      getRecentFiles: () => Promise<any[]>;
      getPinnedFolders: () => Promise<{ name: string; path: string; icon: string }[]>;
      resolveIcon: (filePath: string, isDir: boolean) => Promise<string | null>;
      resolveIcons: (items: { path: string; isDir: boolean; name: string }[]) => Promise<Record<string, string | null>>;
      getSpecialIcons: () => Promise<Record<string, string | null>>;
      onCopyProgress: (callback: (data: any) => void) => () => void;
    };
  }
}
export {};
