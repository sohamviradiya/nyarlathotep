"use client";
import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Container, Typography } from '@mui/material';
import GlobalContext from '@/components/mui/theme';
import Link from 'next/link';

export default function Header() {
    return (
        <AppBar position="static">
            <Container sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', }} maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography variant="h2" sx={{ marginRight: '20vw' }}>
                        <Link href="/"> NyarlaThotep </Link>
                    </Typography>
                </Toolbar>
                <HeaderTypoGraphy>
                    <Link href="/user"> Users </Link>
                </HeaderTypoGraphy>
                <HeaderTypoGraphy>
                    <Link href="/community"> Community </Link>
                </HeaderTypoGraphy>
                <AuthActions />
            </Container>
        </AppBar>
    );
};

function AuthActions() {
    const [user, setUser] = useState<string>("");
    useEffect(() => {
        setUser(localStorage.getItem("email") || "");
    }, []);
    if (user?.length) {
        return (
            <>
                <Link href="/profile">
                    <HeaderTypoGraphy>
                        Profile
                    </HeaderTypoGraphy>
                </Link>
                <Link href="/auth/log-out">
                    <HeaderTypoGraphy>
                        Log Out
                    </HeaderTypoGraphy>
                </Link>
            </>
        );
    }
    else {
        return (
            <>
                <Link href="/auth/log-in">
                    <HeaderTypoGraphy>
                        Log In
                    </HeaderTypoGraphy>
                </Link>
                <Link href="/auth/sign-up">
                    <HeaderTypoGraphy>
                        Sign Up
                    </HeaderTypoGraphy>
                </Link>
            </>
        );
    }
};

function HeaderTypoGraphy({ children }: { children: React.ReactNode }) {
    return (
        <Typography variant="h5" noWrap component="a" sx={{ fontWeight: 700, }}>
            {children}
        </Typography>
    )
};