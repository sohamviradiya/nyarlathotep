"use client";
import AnnouncementInput from "@/components/community/input.announcement";
import MemberList from "@/components/community/member-list.community";
import ThemeHydrator from "@/components/mui/theme";
import CommunityRequestButton from "@/components/request-button";
import SkeletonBundle from "@/components/skeleton-bundle";
import { Community_Public, MEMBER_ROLE_TYPE } from "@/server/community/community.module";
import { Container, Grid, Paper, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

function CommunityComponent({ params }: { params: { id: string } }) {
    const [community, setCommunity] = useState<Community_Public>({} as Community_Public);
    useEffect(() => {
        fetchCommunity({ id: params.id }).then((community) => setCommunity(community));
    }, [params.id]);
    return (<Container maxWidth="xl" sx={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {(community.id) ? (<>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12}>
                    <Paper elevation={3}>
                        <Typography variant="h4" sx={{ padding: "1rem" }}>
                            {`${community.name}'s Profile Page`}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: "1rem" }}>
                        <Typography variant="h5">
                            {community.name}
                        </Typography>
                        <Typography variant="body1">
                            {community.description}
                        </Typography>
                        <Typography variant="body1">
                            Since {new Date(community.founded).toUTCString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} spacing={4}>
                    <CommunityAction id={community.id} />
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={3}>
                        <Typography variant="h6">
                            Members:
                        </Typography>
                        <MemberList members={community.members} />
                    </Paper>
                </Grid>
            </Grid>
        </>
        ) : (
            <SkeletonBundle size={4} />
        )}
    </Container>
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
                <Typography variant="body1" gutterBottom>
                    <Link href={`/community/${id}/announcements`} style={{ textDecoration: 'none' }}>Announcements </Link>
                </Typography>
                <AnnouncementInput id={id} />
                <CommunityRequestButton id={id} type="MODERATE" />
            </>
        );
    }
    else if (role == "ADMIN" || role == "MODERATOR") {
        return (
            <>
                <Typography variant="body1" gutterBottom>
                    <Link href={`/community/${id}/announcements`} style={{ textDecoration: 'none' }}> Announcements </Link>
                </Typography>
                <AnnouncementInput id={id} />
                <Typography variant="body1" gutterBottom>
                    <Link href={`/community/${id}/appeals`}> Requests </Link>
                </Typography>
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
    if (!data?.payload?.role) return null;
    return data.payload.role as MEMBER_ROLE_TYPE;
};

export default function Community({ params }: { params: { id: string } }) {
    return (
        <ThemeHydrator>
            <CommunityComponent params={params} />
        </ThemeHydrator>
    )
};