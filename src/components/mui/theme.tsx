"use client";
import { ThemeOptions, ThemeProvider, createTheme } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#28038c',
            light: '#4206f5',
            dark: '#15073d',
        },
        secondary: {
            main: '#6400a2',
        },
    },
    typography: {
        fontSize: 16,
        fontWeightLight: 100,
        fontWeightRegular: 300,
        fontWeightMedium: 500,
    },
};

const theme = createTheme(themeOptions);

export default function ThemeHydrator({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
};