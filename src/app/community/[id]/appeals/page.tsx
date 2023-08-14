"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkeletonBundle from "@/components/skeleton-bundle";
import { Appeal } from "@/server/appeal/appeal.module";
import InvitationList from "@/components/invitations-list";
import GlobalContextProvider from "@/components/context/global-context";

function AppealListComponent({ params }: { params: { id: string } }) {
    const [appeals, setAppeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        fetchAppeals(params.id).then((appeals) => {
            if (appeals === null) {
                alert("You are not authorized to view this page.");
                router.push(`/community/${params.id}`);
                return;
            }
            setAppeals(appeals);
            setLoading(false);
        });
    }, [params.id, router]);
    if (loading) return <SkeletonBundle size={4} />;
    return (<InvitationList invitations={appeals} />);
};


async function fetchAppeals(id: string) {
    const response = await fetch(`/api/community/${id}/appeal`,
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

export default function Appeals({ params }: { params: { id: string } }) {
    return (
        <GlobalContextProvider>
            <AppealListComponent params={params} />
        </GlobalContextProvider>
    )
}