"use client";
import { useEffect, useState } from 'react';
import { Container, Toolbar, Typography } from '@mui/material';
import GlobalContext from '@/components/mui/theme';
import { CopyrightOutlined, GitHub } from '@mui/icons-material';

export default function Footer() {
    return (
        <Container sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            gap: '1rem',
            width: '100%',
        }} maxWidth="xl">

            <Toolbar>
                <CopyrightOutlined sx={{ fontSize: '2rem', margin: '0.5rem' }} />
                <FooterTypoGraphy>
                    2023, Soham Viradiya
                </FooterTypoGraphy>
            </Toolbar>
            <FooterTypoGraphy>
                <FooterDate />
            </FooterTypoGraphy>
            <FooterTypoGraphy>
                <a href={"https://github.com/sohamviradiya/nyarlathotep"} target='_blank'> <GitHub sx={{ fontSize: '2rem' }} /></a>
            </FooterTypoGraphy>
        </Container>
    );
};

function FooterTypoGraphy({ children }: { children: React.ReactNode }) {
    return (
        <Typography variant="h5"
            noWrap
            component="a"
            sx={{
                fontWeight: 700,
                letterSpacing: '.3rem',
            }}
        >
            {children}
        </Typography>
    )
};

function FooterDate() {
    const [date, setDate] = useState<Date>(new Date());
    useEffect(() => {
        const interval = setInterval(() => {
            setDate(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return (
        <>
            {date.toLocaleString()}
        </>
    );
}