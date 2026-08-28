import React from 'react';
import { ViewMode, SortField, SortOrder } from '../types';
interface Props {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onNewFolder: () => void;
    onCut: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onDelete: () => void;
    onRefresh: () => void;
    onOpenTerminal: () => void;
    onSort: (field: SortField) => void;
    sortField: SortField;
    sortOrder: SortOrder;
    hasSelection: boolean;
    hasClipboard: boolean;
}
export declare function ToolBar({ viewMode, onViewModeChange, onNewFolder, onCut, onCopy, onPaste, onDelete, onRefresh, onOpenTerminal, onSort, sortField, sortOrder, hasSelection, hasClipboard, }: Props): React.JSX.Element;
export {};
