"use client";
import { useState } from "react";
import ErrorList from "@/components/error-list";
import { Alert, Button, Container, FormControl, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import GlobalContextProvider from "@/components/context/global-context";
import { Community_Input } from "@/server/community/community.module";

const client_side_errors = ["Password must be at least 8 characters long", "Invalid Email", "Name too short"];

function CreateCommunityComponent() {
    const [errors, setErrors] = useState<string[]>([]);
    const [waiting, setWaiting] = useState<boolean>(false);
    const router = useRouter();
    const [community, setCommunity] = useState<Community_Input>({
        name: "",
        description: "",
    });

    return (
        <Container fixed maxWidth="md" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <Typography variant="h4" component="h1" gutterBottom>Create Community</Typography>
            <FormControl style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <TextField
                    label="Name" variant="filled"
                    onChange={(e) => {
                        if (e.target.value.length < 4) {
                            if (!errors.includes("Name too short"))
                                setErrors([...errors, "Name too short"]);
                        }
                        else {
                            setErrors(errors.filter((error) => error !== "Name too short" && client_side_errors.includes(error)));
                            setCommunity({ ...community, name: e.target.value });
                        }
                    }}
                />

                <TextField label="Description" multiline variant="filled" onChange={(e) => { setCommunity({ ...community, description: e.target.value }); }} />

                <Button variant="contained" sx={{ background: "green" }} onClick={(e) => {
                    e.preventDefault();
                    submitForm(community, setErrors, setWaiting).then((path) => {
                        if (!path)
                            router.back();
                        else
                            router.push(`/community/${path}`);
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

async function submitForm(community: Community_Input, setErrors: (errors: string[]) => void, setWaiting: (waiting: boolean) => void) {
    setWaiting(true);
    const response = await fetch("/api/community", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            community
        }),
    });

    const data = await response.json();
    if (data?.payload?.community?.id) {
        return data.payload.community.id;
    }
    else {
        setErrors([data.message]);
        setWaiting(false);
        return null;
    }
}

export default function CreateCommunity() {
    return (
        <GlobalContextProvider>
            <CreateCommunityComponent />
        </GlobalContextProvider>
    );
};