"use client";
import UserInfo from "@/components/info.user";
import SkeletonBundle from "@/components/skeleton-bundle";
import { User_Public } from "@/server/user/user.module";
import { useEffect, useState } from "react";
import GlobalContext from "@/components/global-context";
import { Container } from "@mui/material";

function UserComponent({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<User_Public>({} as User_Public);
    useEffect(() => {
        fetchUser({ id: params.id }).then((user) => setUser(user));
    }, [params.id]);
    return (
        <Container maxWidth="xl" sx={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {(user.email) ? <UserInfo user={user} /> : <SkeletonBundle size={3} />}
        </Container>
    );
}

async function fetchUser({ id }: { id: string }): Promise<User_Public> {
    const res = await fetch(`/api/user/${id}`);
    const user = (await res.json()).payload.user;
    return user;
}

export default function ContactList({ params }: { params: { id: string } }) {
    return (
        <GlobalContext>
            <UserComponent params={params} />
        </GlobalContext>
    );
};