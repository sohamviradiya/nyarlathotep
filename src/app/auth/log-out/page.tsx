"use client";
import { useRouter } from "next/navigation";
import { Metadata } from "next";
import GlobalContext from "@/components/global-context";
import { Button, ButtonGroup, Container, Typography } from "@mui/material";

function LogoutComponent() {
    const router = useRouter();
    return (
        <Container sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: '75vh',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Typography variant="h4"
                noWrap
                sx={{
                    fontWeight: 700,
                }}
            >Are you sure you want to log out?</Typography>
            <ButtonGroup variant="contained">
                <Button onClick={() => {
                    localStorage.removeItem("email");
                    localStorage.removeItem("token");
                    router.push("/");

                }}>Yes</Button>
                <Button onClick={() => {
                    router.back();
                }}>No</Button>
            </ButtonGroup>
        </Container>
    )
};


export default function Logout() {
    return (
        <GlobalContext>
            <LogoutComponent />
        </GlobalContext>
    );
}