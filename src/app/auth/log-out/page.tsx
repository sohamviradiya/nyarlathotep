"use client";
import { useRouter } from "next/navigation";
import GlobalContextProvider from "@/components/context/global-context";
import { Button, ButtonGroup, Container, Typography } from "@mui/material";
import { AuthContext } from "@/components/context/auth-context";
import { useContext } from "react";

function LogoutComponent() {
    const router = useRouter();
    const { email, setEmail } = useContext(AuthContext);
    return (
        <Container sx={{
            display: 'flex', flexDirection: 'column', gap: '1rem', height: '75vh', justifyContent: 'center', alignItems: 'center',
        }}>
            <Typography variant="h4" noWrap sx={{ fontWeight: 700, }}>Are you sure you want to log out?</Typography>
            <ButtonGroup variant="contained">    <Button onClick={() => {
                setEmail("");
                localStorage.removeItem("email");
                localStorage.removeItem("token");
                router.push("/");
            }}>Yes</Button>
                <Button onClick={() => { router.back(); }}>No</Button>
            </ButtonGroup>
        </Container>
    )
};


export default function Logout() {
    return (
        <GlobalContextProvider>
            <LogoutComponent />
        </GlobalContextProvider>
    );
}