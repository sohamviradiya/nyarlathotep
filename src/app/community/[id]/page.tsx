"use client";
import MemberList from "@/components/community/member-list.community";
import CommunityRequestButton from "@/components/request-button";
import SkeletonBundle from "@/components/skeleton-bundle";
import { Community_Public, MEMBER_ROLE_TYPE } from "@/server/community/community.module";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Community({ params }: { params: { id: string } }) {
    const [community, setCommunity] = useState<Community_Public>({} as Community_Public);
    useEffect(() => {
        fetchCommunity({ id: params.id }).then((community) => setCommunity(community));
    }, [params.id]);
    return (<main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "10vh", flexDirection: "column", justifyContent: "top", alignItems: "center" }} >
        {(community.id) ? (<>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "70%" }}>
                {`${community.name}'s Profile Page`}
            </h1>
            <div style={{ backgroundColor: "darkblue", padding: "2rem", width: "70%" }}>
                <h2>{community.name}</h2>
                <h3>{community.description}</h3>
                <h3>Since {new Date(community.founded).toLocaleDateString()}</h3>
            </div>
            <CommunityAction id={community.id} />
            <div style={{ backgroundColor: "darkblue", padding: "2rem", width: "70%" }}>
                <h2>Members: </h2>
                <MemberList members={community.members} />
            </div>
        </>
        ) : (
            <SkeletonBundle size={4} />
        )}
    </main>
    );
}

function CommunityAction({ id }: { id: string }) {
    const [role, setRole] = useState<MEMBER_ROLE_TYPE | null>(null);
    useEffect(() => {
        fetchRole(id).then((role) => setRole(role));
    }, [id]);
    if (!role || role == "BANNED") {
        return <CommunityRequestButton id={id} type="JOIN" />;
    }
    if (role == "PARTICIPANT") {
        return (
            <>
                <Link href={`/community/${id}/announcements`}>
                    Announcements
                </Link>
                <CommunityRequestButton id={id} type={"MODERATE"} />
            </>
        );
    }
    else if (role == "ADMIN" || role == "MODERATOR") {
        return (
            <>
                <Link href={`/community/${id}/announcements`}>
                    Announcements
                </Link>
                <Link href={`/community/${id}/appeals`}>
                    Join Requests
                </Link>
            </>
        );
    }
};


async function fetchCommunity({ id }: { id: string }): Promise<Community_Public> {
    const res = await fetch(`/api/community/${id}`);
    const community = (await res.json()).payload.community;
    return community;
}

async function fetchRole(id: string) {
    const response = await fetch(`/api/community/${id}/role`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
        });
    const data = await response.json();
    if (!data.payload.role) return null;
    return data.payload.role as MEMBER_ROLE_TYPE;
};