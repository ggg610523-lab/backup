import React from 'react';
import { FileItem } from '../types';
interface Props {
    files: FileItem[];
    selectedFiles: Set<string>;
    currentPath: string;
    isSearching: boolean;
    searchQuery: string;
}
export declare function StatusBar({ files, selectedFiles, currentPath, isSearching, searchQuery }: Props): React.JSX.Element;
export {};
