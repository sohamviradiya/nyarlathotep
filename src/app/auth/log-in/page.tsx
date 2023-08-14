"use client";
import { Metadata } from "next";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Container, FilledInput, FormControl, IconButton, InputAdornment, InputLabel, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ErrorList from "@/components/error-list";
import GlobalContextProvider from "@/components/context/global-context";
import { AuthContext } from "@/components/context/auth-context";

const client_side_errors = ["Password must be at least 8 characters long", "Invalid Email"];

function LoginComponent() {
    const [user, setUser] = useState<{ email: string, password: string }>({
        password: "",
        email: "",
    });
    const { email, setEmail } = useContext(AuthContext);
    const [errors, setErrors] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        setEmail("");
        localStorage.removeItem("email");
        localStorage.removeItem("token");
    },[]);
    return (
        <Container fixed maxWidth="md" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <FormControl variant="filled" sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <FilledInput
                        type={showPassword ? 'text' : 'password'}
                        id="password"
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
                <Button variant="contained" sx={{ background: "green" }} onClick={(e) => {
                    e.preventDefault();
                    submitForm(user, setErrors, setWaiting).then((email) => {
                        if (email) {
                            setEmail(email);
                            router.push('/profile');
                        }
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
    password: string,
}, setErrors: (errors: string[]) => void, setWaiting: (waiting: boolean) => void) {
    setWaiting(true);
    const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            auth: {
                email: user.email,
                password: user.password,
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


export default function Login() {
    return (
        <GlobalContextProvider>
            <LoginComponent />
        </GlobalContextProvider>
    )
}

