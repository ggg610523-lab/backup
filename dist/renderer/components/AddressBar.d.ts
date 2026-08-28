import React from 'react';
interface Props {
    path: string;
    onNavigate: (path: string) => void;
    onGoBack: () => void;
    onGoForward: () => void;
    onGoUp: () => void;
    onGoHome: () => void;
    canGoBack: boolean;
    canGoForward: boolean;
    onSearch: (query: string) => void;
}
export declare function AddressBar({ path, onNavigate, onGoBack, onGoForward, onGoUp, onGoHome, canGoBack, canGoForward, onSearch }: Props): React.JSX.Element;
export {};
