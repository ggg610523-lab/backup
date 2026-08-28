import React from 'react';
import { FileItem, ViewMode } from '../types';
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
export declare function FileView({ files, loading, viewMode, selectedFiles, onSelect, onSelectAll, onClearSelection, onOpen, onRename, onContextMenu, isSearching, animKey }: Props): React.JSX.Element;
export {};
