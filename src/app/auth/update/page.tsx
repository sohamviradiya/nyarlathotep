"use client";
import { Metadata } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Container, FilledInput, FormControl, IconButton, InputAdornment, InputLabel, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ErrorList from "@/components/error-list";
import ThemeHydrator from "@/components/mui/theme";

const client_side_errors = ["Password must be at least 8 characters long", "Invalid Email"];

function UpdateComponent() {
    const [user, setUser] = useState<{ email: string, currentPassword: string, newPassword: string }>({ newPassword: "", email: "", currentPassword: "" });
    const [errors, setErrors] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const email = localStorage.getItem("email");
        if (!email) router.push("/auth/log-in");
        else
            setUser({ currentPassword: "", newPassword: "", email: email });
        localStorage.removeItem("token");
    }, [router]);

    return (
        <Container fixed maxWidth="md" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            <FormControl variant="filled" sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <TextField label="Email" variant="filled" type="email" disabled value={user.email} />
                <FormControl variant="filled" sx={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
                    <InputLabel htmlFor="current-password" >Password</InputLabel>
                    <FilledInput id="current-password" type={showPassword ? 'text' : 'password'} endAdornment={
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
                                    setUser({ ...user, currentPassword: e.target.value });
                                    setErrors(errors.filter((error) => error !== "Password must be at least 8 characters long" && client_side_errors.includes(error)));
                                }
                            }
                        }
                    />
                </FormControl>
                <FormControl variant="filled" sx={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
                    <InputLabel htmlFor="new-password" >New Password</InputLabel>
                    <FilledInput id="new-password" type={showPassword ? 'text' : 'password'} endAdornment={
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
                                    setUser({ ...user, newPassword: e.target.value });
                                    setErrors(errors.filter((error) => error !== "Password must be at least 8 characters long" && client_side_errors.includes(error)));
                                }
                            }
                        }
                    />
                </FormControl>
                <Button variant="contained" sx={{ background: "green" }} onClick={(e) => {
                    e.preventDefault();
                    submitForm(user, setErrors, setWaiting).then((email) => {
                        if (email)
                            router.push('/profile');
                    });
                }} disableElevation disabled={errors.length > 0}>
                    Submit
                </Button>
            </FormControl>
            {(errors.length > 0) ? <ErrorList errors={errors} /> : <></>}
            {waiting ? <Alert severity="info">Wait a moment...</Alert> : <></>}
        </Container>
    );

}


async function submitForm(user: {
    email: string,
    currentPassword: string,
    newPassword: string
}, setErrors: (errors: string[]) => void, setWaiting: (waiting: boolean) => void) {
    setWaiting(true);
    const response = await fetch("/api/auth", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            auth: {
                email: user.email,
                currentPassword: user.currentPassword,
                newPassword: user.newPassword,
            }
        }),
    });
    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.payload.token);
        localStorage.setItem("email", user.email);
        return user.email;
    }
    else {
        const data = await response.json();
        setErrors([data.message]);
        setWaiting(false);
        return null;
    }
}



export const metadata: Metadata = {
    title: "Log In",
    description: "Log In Page for NyarlaThotep",
};

export default function Update() {
    return (
        <ThemeHydrator>
            <UpdateComponent />
        </ThemeHydrator>
    )
}

