import React from 'react';
interface Props {
    path: string | null;
    isDir: boolean;
    name?: string;
    size?: number;
    iconPath?: string | null;
    className?: string;
    style?: React.CSSProperties;
}
export declare function SystemIcon({ path: filePath, isDir, name, size, iconPath, className, style }: Props): React.JSX.Element;
export {};
