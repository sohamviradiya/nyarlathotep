"use client";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { User_Public } from "@/server/user/user.module";
import Link from "next/link";

export function UserSearch() {
    const [users, setUsers] = useState<User_Public[]>([]);
    const [search_string, setSearchString] = useState<string>("");
    useEffect(() => {
        SearchUsers(search_string).then((users: any[]) => {
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

async function SearchUsers(search_string: string) {
    const response = await fetch(`api/user/?query=${encodeURIComponent(search_string)}&limit=20`);
    const users = (await response.json()).payload.users;
    return users;
}