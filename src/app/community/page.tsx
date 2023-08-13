"use client";
import { Metadata } from "next";
import { TextField, Autocomplete, Container, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { User_Public } from "@/server/user/user.module";
import Link from "next/link";
import ThemeHydrator from "@/components/mui/theme";


function CommunityComponent() {
    return (
        <Container sx={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "4rem" }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Find Communities
            </Typography>
            <CommunitySearch />
        </Container>
    )
}

function CommunitySearch() {
    const [communities, setCommunities] = useState<User_Public[]>([]);
    const [search_string, setSearchString] = useState<string>("");
    useEffect(() => {
        searchCommunities(search_string).then((users: any[]) => {
            setCommunities(users);
        })
    }, [search_string]);

    return (
        <Autocomplete
            disablePortal
            options={communities}
            sx={{ width: 300 }}
            getOptionLabel={(option) => (option.name)}
            renderOption={(props, option) => (
                <Box component="li" {...props}>
                    <Link href={`/community/${encodeURIComponent(option.id)}`}> {option.name} </Link>
                </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Communities" onChange={(e) => { setSearchString(e.target.value) }} />}
        />
    );
};

async function searchCommunities(search_string: string) {
    const response = await fetch(`/api/community/?query=${encodeURIComponent(search_string)}&limit=20`);
    const communities = (await response.json()).payload.communities;
    return communities;
}

export default function Community() {
    return (
        <ThemeHydrator>
            <CommunityComponent />
        </ThemeHydrator>
    )
};