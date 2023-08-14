"use client";
import AppealList from "@/components/profile/appeal-list.profile";
import UserInfo from "@/components/info.user";
import InvitationList from "@/components/invitations-list";
import SkeletonBundle from "@/components/skeleton-bundle";
import { User_Private, User_Public } from "@/server/user/user.module";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GlobalContext from "@/components/global-context";
import { Box, Button, Container, Grid } from "@mui/material";

function ProfileComponent() {
    const router = useRouter();
    const [user, setUser] = useState<User_Private>();
    const [waiting, setWaiting] = useState<boolean>(true);
    useEffect(() => {
        const token = localStorage.getItem('token') as string;
        if (!token) router.push("/auth/log-in");
        else {
            fetchProfile(token)
                .then((user) => {
                    if (!user) router.push("/auth/log-in");
                    setUser(user);
                    setWaiting(false);
                })
                .catch((error) => {
                    setWaiting(false);
                    router.push("/auth/log-in");
                });
        }
    }, [router]);
    return (<Container maxWidth="xl" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "6rem" }}>
        {(waiting || !user) ? (<SkeletonBundle size={4} />) : (
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <UserInfo user={user as User_Public} />
                </Grid>
                <Grid item xs={12}>
                    <ProfileActions />
                </Grid>
                <Grid item xs={6}>
                    <AppealList appeals={user.appeals as string[]} />
                </Grid>
                <Grid item xs={6}>
                    <InvitationList invitations={user.invitations as string[]} />
                </Grid>
            </Grid>
        )}
    </Container>);
};

function ProfileActions() {
    return (<Box display="flex" justifyContent="center" alignItems="center" gap={2}>
        <Button variant="contained" color="primary" href="/profile/settings"> Edit Profile </Button>
        <Button variant="contained" color="primary" href="/auth/update"> Change Password </Button>
        <Button variant="contained" color="primary" href="/profile/contacts"> Manage Contacts </Button>
        <Button variant="contained" color="primary" href="/community/create"> Create Community </Button>
    </Box>)
};

async function fetchProfile(token: string): Promise<User_Private> {
    const response = await fetch("/api/profile", {
        method: "GET", headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.payload.user;
}

export default function Profile() {
    return (
        <GlobalContext>
            <ProfileComponent />
        </GlobalContext>
    );
}