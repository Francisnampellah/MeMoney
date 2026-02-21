export type ThemeMode = 'light' | 'dark';

export const lightColors = {
    // Brand Colors
    primary: '#1976D2', // Blue
    secondary: '#FFFFFF', // White

    // Backgrounds
    background: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardDark: '#F5F5F5',

    // Text
    text: {
        primary: '#000000',
        secondary: '#666666',
        inverse: '#FFFFFF',
        accent: '#1976D2',
        muted: '#999999',
    },

    // Status
    success: '#00D68F',
    error: '#FF5252',
    warning: '#FFB800',
    info: '#1976D2',

    // UI Elements
    border: '#E0E0E0',
    borderDark: '#CCCCCC',
    divider: '#EEEEEE',
    placeholder: '#DFDFDF',

    // Overlay/Modal
    backdrop: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors = {
    // Brand Colors
    primary: '#1A237E', // Dark Blue
    secondary: '#000000', // Black

    // Backgrounds
    background: '#000000',
    surface: '#121212',
    card: '#1E1E1E',
    cardDark: '#0A0A0A',

    // Text
    text: {
        primary: '#FFFFFF',
        secondary: '#B0B0B0',
        inverse: '#000000',
        accent: '#42A5F5',
        muted: '#808080',
    },

    // Status
    success: '#00D68F',
    error: '#FF5252',
    warning: '#FFB800',
    info: '#42A5F5',

    // UI Elements
    border: '#2C2C2C',
    borderDark: '#1E1E1E',
    divider: '#1A1A1A',
    placeholder: '#404040',

    // Overlay/Modal
    backdrop: 'rgba(0, 0, 0, 0.8)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 100,
};

export const createTheme = (mode: ThemeMode) => ({
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    borderRadius,
    mode,
});

// Default theme for backward compatibility during transition
export const theme = createTheme('dark');

export { useAppTheme as useTheme } from './ThemeContext';
