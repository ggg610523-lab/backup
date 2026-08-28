import React from 'react';
interface MenuItem {
    label: string;
    icon?: React.ReactNode;
    action?: () => void;
    divider?: boolean;
    disabled?: boolean;
}
interface Props {
    visible: boolean;
    x: number;
    y: number;
    items: MenuItem[];
    onClose: () => void;
}
export declare function ContextMenu({ visible, x, y, items, onClose }: Props): React.JSX.Element | null;
export {};
