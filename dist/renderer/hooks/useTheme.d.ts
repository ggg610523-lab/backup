import { ThemeMode } from '../types';
export declare function useTheme(): {
    theme: "light" | "dark";
    themeMode: ThemeMode;
    setTheme: (mode: ThemeMode) => void;
};
