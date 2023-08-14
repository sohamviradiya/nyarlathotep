"use client";
import { ThemeOptions, ThemeProvider, createTheme } from '@mui/material/styles';
import Header from '@/components/header';
import Footer from '@/components/footer';
import AuthProvider from './auth-context';
const themeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#4843ac',
            light: '#4206f5',
            dark: '#15073d',
        },
        secondary: {
            main: '#6400a2',
            light: '#8c00d4',
            dark: '#3c0070',
        },
        background: {
            default: '#000000',
        },
        text: {
            primary: '#ffffff',
            secondary: '#fffffff',
        }
    },
};

const theme = createTheme(themeOptions);

export default function GlobalContextProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Header />
                {children}
                <Footer />
            </AuthProvider>
        </ThemeProvider>
    );
};
