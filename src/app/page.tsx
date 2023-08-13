"use client";
import ThemeHydrator from "@/components/mui/theme";
import { Button, Container, Grid, Paper, Typography } from "@mui/material";
import { Metadata } from "next";

function HomeComponent() {
    return (
        <Container maxWidth="xl">
            <Paper elevation={3} sx={{ minHeight: "80vh", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '3rem' }}>
                <Typography variant="h4" >
                    NyarlaThotep Secure Chat App
                </Typography>
                <Typography variant="h5" >
                    Connect with anyone, anywhere, anytime.
                </Typography>
                <Typography variant="h6" >
                    Securely. Anonymously. Privately.
                </Typography>
                <Grid container sx={{ width: "30%" }} rowSpacing={3} columnSpacing={1} >
                    <Grid item xs={6} >
                        <Button variant="contained" size="large" color="primary" href="/auth/log-in">
                            Login
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button variant="contained" size="large" color="primary" href="/auth/sign-up">
                            Register
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button variant="contained" size="large" color="primary" href="/user">
                            Find Users
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button variant="contained" size="large" color="primary" href="/community">
                            Find Communities
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container >
    )
}

export default function Home() {
    return (
        <ThemeHydrator>
            <HomeComponent />
        </ThemeHydrator>
    )
};


export const metadata: Metadata = {
    title: "NyarlaThotep",
    description: "A social media platform",
};

