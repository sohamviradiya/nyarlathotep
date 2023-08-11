import { Metadata } from "next";
import { TextField, Autocomplete, Container, Box, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { User_Public } from "@/server/user/user.module";
import Link from "next/link";
import ThemeHydrator from "@/components/mui/theme";

function UserComponent() {
    return (
        <main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "20vh", flexDirection: "column", justifyContent: "top" }}>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Find Users
            </h1>
            <UserSearch />
        </main>
    );
};

export function UserSearch() {
    const [users, setUsers] = useState<User_Public[]>([]);
    const [search_string, setSearchString] = useState<string>("");
    useEffect(() => {
        searchUsers(search_string).then((users: any[]) => {
            setUsers(users);
        })
    }, [search_string]);

    return (<Container sx={{ backgroundColor: "darkgray", padding: "0.5rem", width: "fit-content", borderRadius: "0.5rem" }}>
        <Autocomplete
            disablePortal
            id="combo-box-demo"
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
    </Container>
    );
};

async function searchUsers(search_string: string) {
    const response = await fetch(`/api/user/?query=${encodeURIComponent(search_string)}&limit=20`);
    const users = (await response.json()).payload.users;
    return users;
}

export const metadata: Metadata = {
    title: "Search for Users",
    description: "Search for Users",
};

export default function UsersPage() {
    return (
        <ThemeHydrator>
            <UserComponent />
        </ThemeHydrator>
    );
};