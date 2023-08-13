"use client";
import { Metadata } from "next";
import { useState, useEffect } from "react";
import ErrorList from "@/components/error-list";
import { User_Input } from "@/server/user/user.module";
import { Alert, Button, Container, FilledInput, FormControl, IconButton, InputAdornment, InputLabel, TextField } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from "next/navigation";
import ThemeHydrator from "@/components/mui/theme";

const client_side_errors = ["Password must be at least 8 characters long", "Invalid Email", "Name too short"];

function SignUpComponent() {
    const [errors, setErrors] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const router = useRouter();
    const [user, setUser] = useState<User_Input>({
        password: "",
        email: "",
        name: "",
        address: "",
        bio: "",
    });

    useEffect(() => {
        localStorage.removeItem("email");
        localStorage.removeItem("token");
    }, []);

    return (
        <Container fixed maxWidth="md" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <FormControl style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <TextField
                    label="Name"
                    variant="filled"
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
                />

                <TextField
                    label="Email"
                    variant="filled"
                    type="email"
                    onChange={(e) => {
                        if (e.target.validity.typeMismatch) {
                            if (!errors.includes("Invalid Email"))
                                setErrors([...errors, "Invalid Email"]);
                        }
                        else {
                            setErrors(errors.filter((error) => error !== "Invalid Email" && client_side_errors.includes(error)));
                            setUser({ ...user, email: e.target.value });
                        }
                    }}
                />
                <FormControl variant="filled">
                    <InputLabel htmlFor="password" >Password</InputLabel>
                    <FilledInput id="password" type={showPassword ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={() => { setShowPassword(!showPassword) }} onMouseDown={(e) => { e.preventDefault(); }} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        onChange={
                            (e) => {
                                if (e.target.value.length < 8) {
                                    if (!errors.includes("Password must be at least 8 characters long"))
                                        setErrors([...errors, "Password must be at least 8 characters long"]);
                                }
                                else {
                                    setUser({ ...user, password: e.target.value });
                                    setErrors(errors.filter((error) => error !== "Password must be at least 8 characters long" && client_side_errors.includes(error)));
                                }
                            }
                        }
                    />
                </FormControl>
                <TextField label="Address" multiline variant="filled" onChange={(e) => { setUser({ ...user, address: e.target.value }); }} />

                <TextField label="Bio" multiline variant="filled" onChange={(e) => { setUser({ ...user, bio: e.target.value }); }} />

                <Button variant="contained" sx={{ background: "green" }} onClick={(e) => {
                    e.preventDefault();
                    submitForm(user, setErrors, setWaiting).then((path) => {
                        router.push('/auth/log-in');
                    });
                }} disableElevation disabled={errors.length > 0}>
                    Submit
                </Button>
            </FormControl>
            {(errors.length > 0) ? <ErrorList errors={errors} /> : <></>}
            {waiting ? <Alert severity="info">Wait a moment...</Alert> : <></>}
        </Container >
    )
};

async function submitForm(user: User_Input, setErrors: (errors: string[]) => void, setWaiting: (waiting: boolean) => void) {
    setWaiting(true);
    const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Sign Up Page for NyarlaThotep",
};

export default function SignUp() {
    return (
        <ThemeHydrator>
            <SignUpComponent />
        </ThemeHydrator>
    );
};