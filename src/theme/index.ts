export type ThemeMode = 'light' | 'dark';

export const lightColors = {
    // Brand Colors
    primary: '#C5FF00', // Lime Accent
    secondary: '#000000', // True Black

    // Backgrounds
    background: '#F8F8F8',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardDark: '#F0F0F0',

    // Text
    text: {
        primary: '#000000',
        secondary: '#666666',
        inverse: '#FFFFFF',
        accent: '#C5FF00',
        muted: '#999999',
    },

    // Status
    success: '#00D68F',
    error: '#FF5252',
    warning: '#FFB800',
    info: '#0288D1',

    // UI Elements
    border: '#E5E5E5',
    borderDark: '#CCCCCC',
    divider: '#F5F5F5',
    placeholder: '#CCCCCC',

    // Overlay/Modal
    backdrop: 'rgba(0, 0, 0, 0.5)',
};

export const darkColors = {
    // Brand Colors
    primary: '#C5FF00', // Lime Accent
    secondary: '#FFFFFF',

    // Backgrounds
    background: '#000000',
    surface: '#1A1A1A',
    card: '#1A1A1A',
    cardDark: '#121212',

    // Text
    text: {
        primary: '#FFFFFF',
        secondary: '#999999',
        inverse: '#000000',
        accent: '#C5FF00',
        muted: '#666666',
    },

    // Status
    success: '#00D68F',
    error: '#FF5252',
    warning: '#FFB800',
    info: '#0288D1',

    // UI Elements
    border: '#333333',
    borderDark: '#444444',
    divider: '#222222',
    placeholder: '#555555',

    // Overlay/Modal
    backdrop: 'rgba(0, 0, 0, 0.7)',
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
