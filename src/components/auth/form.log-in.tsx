"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import { Button, FilledInput, FormControl, IconButton, InputAdornment, InputLabel } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ErrorList from "./error-list.form";

const client_side_errors = ["Password must be at least 8 characters long", "Invalid Email"];

export default function Login() {
    const [user, setUser] = useState<{ email: string, password: string }>({
        password: "",
        email: "",
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        localStorage.removeItem("email");
        localStorage.removeItem("token");
    }, []);

    return (
        <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "3rem", color: "black", width: "70%", alignSelf: "center" }}>
            <form style={{ display: "flex", flexDirection: "column", gap: "1rem", }}>
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
                    <InputLabel htmlFor="filled-adornment-password" >Password</InputLabel>
                    <FilledInput
                        id="filled-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => { setShowPassword(!showPassword) }}
                                    onMouseDown={(e) => { e.preventDefault(); }}
                                    edge="end"
                                >
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
                            localStorage.setItem("email", email);
                            router.push('/profile');
                        }
                    });
                }} disableElevation disabled={errors.length > 0}>
                    Submit
                </Button>
            </form>
            {(errors.length > 0) ? <ErrorList errors={errors} /> : <></>}
            {waiting ? <p>Waiting...</p> : <></>}
        </div>
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
        return user.email;
    }
    else {
        const data = await response.json();
        setErrors([data.message]);
        setWaiting(false);
        return null;
    }
}