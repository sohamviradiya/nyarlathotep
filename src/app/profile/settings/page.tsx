"use client";
import { Metadata } from "next";
import { useState, useEffect } from "react";
import ErrorList from "@/components/error-list";
import { User_Input, User_Private } from "@/server/user/user.module";
import { Alert, Button, Container, FilledInput, FormControl, IconButton, InputAdornment, InputLabel, TextField } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from "next/navigation";
import GlobalContext from "@/components/mui/theme";

const client_side_errors = ["Password must be at least 8 characters long", "Invalid Email", "Name too short"];

function SettingsComponent() {
    const [errors, setErrors] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const router = useRouter();
    const [user, setUser] = useState<{
        email: string,
        name: string,
        address: string,
        bio: string,
    }>({
        email: "",
        name: "",
        address: "",
        bio: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token)
            router.push('/auth/log-in');
        else
            fetchProfile(token).then((user) => {
                setUser({
                    email: user.email,
                    name: user.name,
                    address: user.address || "",
                    bio: user.bio || "",
                })
            });
    }, [router]);

    return (
        <Container fixed maxWidth="md" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <FormControl style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <TextField label="Name" variant="filled"
                    onChange={(e) => {
                        if (e.target.value.length < 4) {
                            if (!errors.includes("Name too short"))
                                setErrors([...errors, "Name too short"]);
                        }
                        else {
                            setErrors(errors.filter((error) => error !== "Name too short" && client_side_errors.includes(error)));
                            setUser({ ...user, name: e.target.value });
                        }
                    }}
                    value={user.name} />

                <TextField label="Email" variant="filled" type="email" value={user.email} disabled />
                <TextField label="Address" multiline variant="filled" onChange={(e) => { setUser({ ...user, address: e.target.value }); }} value={user.address} />
                <TextField label="Bio" multiline variant="filled" onChange={(e) => { setUser({ ...user, bio: e.target.value }); }} value={user.bio} />

                <Button variant="contained" sx={{ background: "green" }} onClick={(e) => {
                    e.preventDefault();
                    submitForm(user, setErrors, setWaiting).then((path) => {
                        router.push('/profile');
                    });
                }} disableElevation disabled={errors.length > 0}>
                    Submit
                </Button>
            </FormControl>
            {(errors.length > 0) ? <ErrorList errors={errors} /> : <></>}
            {waiting ? <Alert severity="info">Wait a moment...</Alert> : <></>}
        </Container>
    )
};

async function submitForm(user: { email: string, name: string, address: string, bio: string, }, setErrors: (errors: string[]) => void, setWaiting: (waiting: boolean) => void) {
    setWaiting(true);
    const token = localStorage.getItem("token");
    const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            user
        }),
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    }
    else {
        const data = await response.json();
        setErrors([data.message]);
        setWaiting(false);
        return null;
    }
}

async function fetchProfile(token: string): Promise<User_Private> {
    const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!data?.payload) throw new Error(data.message);
    return data.payload.user;
}

export default function SignUp() {
    return (
        <GlobalContext>
            <SettingsComponent />
        </GlobalContext>
    );
};