"use client";

import { TextField, Autocomplete, Container, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { User_Public } from "@/server/user/user.module";
import Link from "next/link";

export function CommunitySearch() {
    const [communities, setCommunities] = useState<User_Public[]>([]);
    const [search_string, setSearchString] = useState<string>("");
    useEffect(() => {
        searchCommunities(search_string).then((users: any[]) => {
            setCommunities(users);
        })
    }, [search_string]);

    return (<Container sx={{ backgroundColor: "darkgray", padding: "0.5rem", width: "fit-content", borderRadius: "0.5rem" }}>
        <Autocomplete
            disablePortal
            id="combo-box-demo"
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
    </Container>
    );
};

async function searchCommunities(search_string: string) {
    const response = await fetch(`/api/community/?query=${encodeURIComponent(search_string)}&limit=20`);
    const communities = (await response.json()).payload.communities;
    return communities;
}