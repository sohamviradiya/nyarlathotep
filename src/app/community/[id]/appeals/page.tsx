"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkeletonBundle from "@/components/skeleton-bundle";
import { Appeal } from "@/server/appeal/appeal.module";
import InvitationList from "@/components/invitations-list";

export default function Appeals({ params }: { params: { id: string } }) {
    const [appeals, setAppeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        fetchAppeals(params.id).then((appeals) => {
            if (!appeals) {
                alert("You are not authorized to view this page.");
                router.push(`/community/${params.id}`);
                return;
            }
            setAppeals(appeals);
            setLoading(false);
        });
    });
    if (loading) return <SkeletonBundle size={4} />;
    return (<main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "10vh", flexDirection: "column", justifyContent: "top", alignItems: "center" }} >
        <InvitationList invitations={appeals} />
    </main>
    );
};


async function fetchAppeals(id: string) {
    const response = await fetch(`/api/community/${id}/appeals`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
    const data = await response.json();
    if (data?.payload?.appeals)
        return data.payload.appeals as Appeal[];
    else
        return null;
};