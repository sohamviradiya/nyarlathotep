"use client";
import MemberList from "@/components/member-list.community";
import SkeletonBundle from "@/components/skeleton-bundle";
import { Community_Public } from "@/server/community/community.module";
import { Metadata, ResolvingMetadata } from "next";
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

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function fetchCommunity({ id }: { id: string }): Promise<Community_Public> {
    const res = await fetch(`/api/community/${id}`);
    const community = (await res.json()).payload.community;
    return community;
}
