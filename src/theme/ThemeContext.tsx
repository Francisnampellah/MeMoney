import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { createTheme, theme as defaultTheme } from './index';
import { useSettings } from '../services/settings';

const ThemeContext = createContext(defaultTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { settings } = useSettings();

    const theme = useMemo(() => {
        return createTheme(settings.theme || 'dark');
    }, [settings.theme]);

    // We are not using a traditional ThemeProvider from a library, 
    // but we can provide our theme object globally.
    // Note: Most existing components import 'theme' from '../theme' directly.
    // To make it truly dynamic, we would need to wrap them or use a hook.

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    return useContext(ThemeContext);
}
