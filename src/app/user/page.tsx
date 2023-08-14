"use client";
import { Metadata } from "next";
import { TextField, Autocomplete, Container, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { User_Public } from "@/server/user/user.module";
import Link from "next/link";
import GlobalContext from "@/components/mui/theme";

function UserComponent() {
    return (
        <Container sx={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "4rem" }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Find Users
            </Typography>
            <UserSearch />
        </Container>
    );
};

function UserSearch() {
    const [users, setUsers] = useState<User_Public[]>([]);
    const [search_string, setSearchString] = useState<string>("");
    useEffect(() => {
        searchUsers(search_string).then((users: any[]) => {
            setUsers(users);
        })
    }, [search_string]);

    return (
        <Autocomplete
            disablePortal
            options={users}
            sx={{ width: 300 }}
            getOptionLabel={(option) => (option.name)}
            renderOption={(props, option) => (
                <Box component="li" {...props}>
                    <Link href={`/user/${encodeURIComponent(option.id)}`}> {option.name} </Link>
                </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Users" onChange={(e) => { setSearchString(e.target.value) }} />}
        />
    );
};

async function searchUsers(search_string: string) {
    const response = await fetch(`/api/user/?query=${encodeURIComponent(search_string)}&limit=20`);
    const users = (await response.json()).payload.users;
    return users;
}

export default function UsersPage() {
    return (
        <GlobalContext>
            <UserComponent />
        </GlobalContext>
    );
};