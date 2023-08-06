"use client";
import { Announcement, } from "@/server/community/community.module";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkeletonBundle from "@/components/skeleton-bundle";

export default function Announcements({ params }: { params: { id: string } }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        fetchAnnouncements(params.id).then((announcements) => {
            if (!announcements) {
                alert("You are not authorized to view this page.");
                router.push(`/community/${params.id}`);
                return;
            }
            setAnnouncements(announcements);
            setLoading(false);
        });
    });
    if (loading) return <SkeletonBundle size={4} />;
    return (<main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "10vh", flexDirection: "column", justifyContent: "top", alignItems: "center" }} >
        <h1> Announcements </h1>
        {announcements.map((announcement) => <AnnouncementComponent announcement={announcement} key={announcement.id} />)}
    </main>
    );
};

function AnnouncementComponent({ announcement }: { announcement: Announcement }) {
    return (
        <div style={{ backgroundColor: "darkblue", padding: "2rem", width: "70%" }}>
            <h2>{announcement.user}</h2>
            <h3>{announcement.content}</h3>
            <h3>{new Date(announcement.time).toLocaleDateString()}</h3>
        </div>
    );
};

async function fetchAnnouncements(id: string) {
    const response = await fetch(`/api/community/${id}/announce`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
    const data = await response.json();
    if (data?.payload?.announcements) {
        return data.payload.announcements as Announcement[];
    }
    else {
        return null;
    }
}