import * as React from 'react';
import { AppBar, Toolbar, Container, Typography, ThemeProvider } from '@mui/material';
import { AuthActions } from '@/components/auth/auth-actions';
import ThemeHydrator from './mui/theme';

function HeaderComponent() {
    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h2"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            display: 'flex',
                            fontWeight: 700,
                            letterSpacing: '.3rem'
                        }}
                    >
                        NyarlaThotep
                    </Typography>
                    <AuthActions />
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default function Header() {
    return (
        <ThemeHydrator>
            <HeaderComponent />
        </ThemeHydrator>);
};