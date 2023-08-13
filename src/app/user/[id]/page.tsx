"use client";
import UserInfo from "@/components/user/info.user";
import SkeletonBundle from "@/components/skeleton-bundle";
import { User_Public } from "@/server/user/user.module";
import { useEffect, useState } from "react";
import ThemeHydrator from "@/components/mui/theme";
import { Container } from "@mui/material";

function UserComponent({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<User_Public>({} as User_Public);
    useEffect(() => {
        fetchUser({ id: params.id }).then((user) => setUser(user));
    }, [params.id]);
    return (
        <Container maxWidth="xl" sx={{height: "80vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
            {(user.email) ? <UserInfo user={user} /> : <SkeletonBundle size={3} />}
        </Container>
    );
}

export async function fetchUser({ id }: { id: string }): Promise<User_Public> {
    const res = await fetch(`/api/user/${id}`);
    const user = (await res.json()).payload.user;
    return user;
}

export default function ContactList({ params }: { params: { id: string } }) {
    return (
        <ThemeHydrator>
            <UserComponent params={params} />
        </ThemeHydrator>
    );
};