import React from 'react';
interface Props {
    onNavigate: (path: string) => void;
    currentPath: string;
}
export declare function NavigationPane({ onNavigate, currentPath }: Props): React.JSX.Element;
export {};
