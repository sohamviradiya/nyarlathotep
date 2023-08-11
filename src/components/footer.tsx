"use client";

import * as React from 'react';
import { AppBar, Toolbar, Container, Typography } from '@mui/material';
import { AuthActions } from '@/components/auth/auth-actions';
import ThemeHydrator from './mui/theme';
import Link from 'next/link';

function FooterComponent() {
    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Link href="/">
                    <Typography
                        variant="h3"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            display:  'flex',
                            fontWeight: 700,
                            letterSpacing: '.3rem'
                        }}
                    >
                        Home
                        </Typography>
                    </Link>
                    <AuthActions />
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default function Footer() {
    return (
        <ThemeHydrator>
        <FooterComponent />
        </ThemeHydrator>
    );
}