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
export declare function TabBar({ tabs, activeTabId, onTabClick, onCloseTab, onNewTab, themeMode, onToggleTheme, onToggleSidebar }: Props): React.JSX.Element;
export {};
