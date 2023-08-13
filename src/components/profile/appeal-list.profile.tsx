import { useState, useEffect } from "react";
import { Appeal } from "@/server/appeal/appeal.module";
import { Button, Card, CardActions, CardContent, CardHeader, Container, List, ListItem, Typography } from "@mui/material";

export default function AppealList({ appeals }: { appeals: string[] }) {
    return (<Container maxWidth="xl">
        <Typography variant="h4" gutterBottom> Appeals: </Typography>
        <List >
            {appeals.map((appeal) => <ListItem key={appeal}><Appeal id={appeal} /></ListItem>)}
        </List>
    </Container>);
}

function Appeal({ id }: { id: string }) {
    const [appeal, setAppeal] = useState<Appeal | null>(null);
    const [withdrawn, setWithdrawn] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('token') as string;
        fetchAppeal(id, token).then((appeal) => {
            setAppeal(appeal);
        }).catch((err) => {
            console.error(err);
        });
    }, [id]);
    return (
        (appeal && !withdrawn) ? (
            <Card variant="outlined">
                <CardHeader title={`${appeal.type} to ${appeal.receiver}`} subheader={`${new Date(appeal.status_changed).toUTCString()}`} />
                <CardContent>
                    <Typography variant="body1" paragraph> {appeal.message} </Typography>
                    <Typography variant="subtitle1" gutterBottom> {appeal.status} </Typography>
                </CardContent>
                <CardActions disableSpacing>
                    <Button variant="contained" onClick={() => {
                        withdrawAppeal(id, localStorage.getItem('token') as string).then(() => {
                            setWithdrawn(true);
                        })
                    }}> Remove </Button>
                </CardActions>
            </Card>) :
            (<></>)
    );
}

async function fetchAppeal(id: string, token: string) {
    const res = await fetch(`/api/appeal/${id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!data.payload) throw new Error(data.message);
    return data.payload.appeal;
}

async function withdrawAppeal(id: string, token: string) {
    const res = await fetch(`/api/appeal/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    return null;
}