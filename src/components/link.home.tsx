"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Stack, Divider, Box, Button } from "@mui/material";

export default function HomeLink() {
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoggedIn(true);
        }
    }, []);
    return (
        <Stack direction="row" sx={{ fontSize: "4rem", alignSelf: "center", backgroundColor: "#404040", padding: "3rem" }} spacing={7} divider={<Divider orientation="vertical" flexItem />}>
            {(loggedIn) ?
                (<>
                    <Link href="/user" >
                        <Box component="span" sx={{ padding: "3rem", backgroundColor: "#101010", }}>
                            Find Users
                        </Box>
                    </Link>
                    <Link href="/community" >
                        <Box component="span" sx={{ padding: "3rem", backgroundColor: "#101010", }}>
                            Find Communities
                        </Box>
                    </Link>
                </>) :
                (<>
                    <Link href="/auth/log-in"  >
                        <Box component="span" sx={{ padding: "3rem", backgroundColor: "#101010", }}>
                            Log In
                        </Box>
                    </Link>
                    <Link href="/auth/sign-up" >
                        <Box component="span" sx={{ padding: "3rem", backgroundColor: "#101010", }}>
                            Sign Up
                        </Box>
                    </Link>

                </>)}
        </Stack>
    );
};