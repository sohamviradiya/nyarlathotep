import { useState, useEffect } from "react";
import { APPEAL_STATUS, APPEAL_STATUS_TYPE, Appeal } from "@/server/appeal/appeal.module";
import SkeletonBundle from "@/components/skeleton-bundle";
import { Button, Card, CardActions, CardHeader, Container, Grid, List, ListItem, Typography } from "@mui/material";

export default function InvitationList({ invitations }: { invitations: string[] }) {
    return (<Container maxWidth="xl">
        <Typography variant="h4" gutterBottom> Invitations: </Typography>
        <List>
            {invitations.map((invitation) => <ListItem key={invitation}> <Invitation invitation_id={invitation} /> </ListItem>)}
        </List>
    </Container>);
};

function Invitation({ invitation_id }: { invitation_id: string }) {
    const [invitation, setInvitation] = useState<Appeal>();
    const [status, setStatus] = useState<APPEAL_STATUS_TYPE>(APPEAL_STATUS.PENDING);
    useEffect(() => {
        const token = localStorage.getItem('token') as string;
        fetchAppeal(invitation_id, token).then((appeal) => {
            setInvitation(appeal);
            if (appeal.status === APPEAL_STATUS.PENDING)
                setStatus(APPEAL_STATUS.UNDER_REVIEW);
            else
                setStatus(appeal.status as APPEAL_STATUS_TYPE);
        }
        ).catch((err) => {
            console.error(err);
        });
    }, [invitation_id]);

    useEffect(() => {
        if (status === APPEAL_STATUS.PENDING) return;
        const token = localStorage.getItem('token') as string;
        var actionResponse;
        if (status === APPEAL_STATUS.ACCEPTED)
            actionResponse = acceptAppeal(invitation_id, token);
        else if (status === APPEAL_STATUS.REJECTED)
            actionResponse = rejectAppeal(invitation_id, token);
        else if (status === APPEAL_STATUS.UNDER_REVIEW)
            actionResponse = markAppeal(invitation_id, token);
        if (!actionResponse) return;
        actionResponse.then(() => {
            fetchAppeal(invitation_id, token).then((appeal) => {
                setInvitation(appeal);
                setStatus(appeal.status as APPEAL_STATUS_TYPE);
            });
        });
    }, [status, invitation_id]);
    return ((invitation) ? (<Card variant="outlined" sx={{ width: "100%", padding: "1rem" }}>
        <CardHeader title={`${invitation.type} from ${invitation.sender}`} subheader={`${new Date(invitation.status_changed).toUTCString()}`} />
        <Typography variant="body1" paragraph>message: {invitation.message} </Typography>
        <Typography variant="subtitle1" gutterBottom>status:  {invitation.status}</Typography>
        <CardActions disableSpacing> <InvitationActions status={status} setStatus={setStatus} /></CardActions>
    </Card>
    ) : (<SkeletonBundle size={1} />));
};

function InvitationActions({ status, setStatus }: { status: APPEAL_STATUS_TYPE, setStatus: (status: APPEAL_STATUS_TYPE) => void }) {
    if (status === APPEAL_STATUS.PENDING) {
        return (<></>);
    }
    else if (status === APPEAL_STATUS.UNDER_REVIEW) {
        return (
            <Grid container sx={{ gap: "1rem" }}>
                <Button variant="contained" color="success" onClick={() => setStatus(APPEAL_STATUS.ACCEPTED)}>Accept</Button>
                <Button variant="contained" color="warning" onClick={() => setStatus(APPEAL_STATUS.REJECTED)}>Reject</Button>
            </Grid>
        );
    }
    else if (status === APPEAL_STATUS.ACCEPTED) {
        return (<></>);
    }
    else if (status === APPEAL_STATUS.REJECTED) {
        return (<Button variant="outlined" onClick={() => setStatus(APPEAL_STATUS.ACCEPTED)}>Accept</Button>);
    }
};

async function fetchAppeal(id: string, token: string) {
    const res = await fetch(`/api/appeal/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!data.payload) return null;
    return data.payload.appeal;
}

async function acceptAppeal(id: string, token: string) {
    const res = await fetch(`/api/appeal/${id}/accept`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!data.payload) return null;
}

async function rejectAppeal(id: string, token: string) {
    const res = await fetch(`/api/appeal/${id}/reject`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!data.payload) return null;
};

async function markAppeal(id: string, token: string) {
    const res = await fetch(`/api/appeal/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!data.payload) return null;
}