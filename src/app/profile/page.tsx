"use client";

import AppealList from "@/components/profile/appeal-list.profile";
import UserInfo from "@/components/user/info.user";
import InvitationList from "@/components/profile/invitation-list.profile";
import SkeletonBundle from "@/components/skeleton-bundle";
import { User_Private, User_Public } from "@/server/user/user.module";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState<User_Private>();
    const [waiting, setWaiting] = useState<boolean>(true);
    useEffect(() => {
        const token = localStorage.getItem("token") as string;
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
    return (<>
        {(waiting || !user) ? (<SkeletonBundle size={5} />) : (
            <>
                <UserInfo user={user as User_Public} />
                <AppealList appeals={user.appeals as string[]} />
                <InvitationList invitations={user.invitations as string[]} />
            </>
        )}
    </>);
};

async function fetchProfile(token: string): Promise<User_Private> {
    const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data.payload.user;
}