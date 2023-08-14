"use client";
import { Announcement } from "@/server/community/community.module";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SkeletonBundle from "@/components/skeleton-bundle";
import GlobalContextProvider from "@/components/context/global-context";
import { Container, List, ListItem, Paper, Typography } from "@mui/material";

function AnnouncementListComponent({ params }: { params: { id: string } }) {
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
    }, [params.id, router]);

    return (<Container sx={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "4rem" }}>
        {(!loading) ? <>
            <Typography variant="h4" component="h1" gutterBottom>Announcements</Typography>
            <List>
                {announcements.map((announcement) => (
                    <ListItem key={announcement.id}>
                        <AnnouncementComponent announcement={announcement} />
                    </ListItem>
                ))}
            </List>
        </> : <SkeletonBundle size={4} />}
    </Container>
    );
};

function AnnouncementComponent({ announcement }: { announcement: Announcement }) {
    return (
        <Paper elevation={3} sx={{ padding: "1rem" }}>
            <Typography variant="h6">
                {announcement.user}
            </Typography>
            <Typography variant="body1">
                {announcement.content}
            </Typography>
            <Typography variant="body1">
                {new Date(announcement.time).toLocaleString()}
            </Typography>
        </Paper>
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


export default function Announcements({ params }: { params: { id: string } }) {
    return (
        <GlobalContextProvider>
            <AnnouncementListComponent params={params} />
        </GlobalContextProvider>
    )
};