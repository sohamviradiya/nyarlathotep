"use client";
import UserInfo from "@/components/info.user";
import SkeletonBundle from "@/components/skeleton-bundle";
import { User_Public } from "@/server/user/user.module";
import { Metadata, ResolvingMetadata } from "next";
import { useEffect, useState } from "react";

export default function User({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<User_Public>({} as User_Public);
    useEffect(() => {
        fetchUser({ id: params.id }).then((user) => setUser(user));
    }, [params.id]);
    return (<main style={{ height: "100vh", display: "flex", gap: "10vh", flexDirection: "column", justifyContent: "top", alignItems: "center" }} >
        <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "50%" }}>
            {`${decodeURIComponent(params.id)}'s Profile Page`}
        </h1>
        {(user.email) ? (
            <UserInfo user={user} />
        ) : (
            <SkeletonBundle size={3} />
        )}
    </main>
    );
}

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function fetchUser({ id }: { id: string }): Promise<User_Public> {
    const res = await fetch(`/api/user/${id}`);
    const user = (await res.json()).payload.user;
    return user;
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent?: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: `${params.id} 's Profile Page`,
        description: `${params.id} 's Profile Page`,
    };
}