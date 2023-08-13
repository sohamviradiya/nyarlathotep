import { useState, useEffect } from "react";
import { APPEAL_STATUS, APPEAL_STATUS_TYPE, Appeal } from "@/server/appeal/appeal.module";
import SkeletonBundle from "@/components/skeleton-bundle";
import { Button, Card, CardActions, CardHeader, Container, List, ListItem, Typography } from "@mui/material";

export default function InvitationList({ invitations }: { invitations: string[] }) {
    return (<Container maxWidth="xl">
        <Typography variant="h4" gutterBottom> Appeals: </Typography>
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
        }
        ).catch((err) => {
            console.error(err);
        });
    }, [invitation_id]);

    useEffect(() => {
        if (status === APPEAL_STATUS.PENDING) return;
        const token = localStorage.getItem('token') as string;
        if (status === APPEAL_STATUS.ACCEPTED) {
            acceptAppeal(invitation_id, token).then(() => {
                fetchAppeal(invitation_id, token).then((appeal) => {
                    setInvitation(appeal);
                });
            });
        } else if (status === APPEAL_STATUS.REJECTED) {
            rejectAppeal(invitation_id, token).then(() => {
                fetchAppeal(invitation_id, token).then((appeal) => {
                    setInvitation(appeal);
                });
            });
        }
        else if (status === APPEAL_STATUS.UNDER_REVIEW) {
            markAppeal(invitation_id, token).then(() => {
                fetchAppeal(invitation_id, token).then((appeal) => {
                    setInvitation(appeal);
                });
            });
        }
    }, [status, invitation_id]);
    return ((invitation) ? (<Card variant="outlined">
        <CardHeader title={`${invitation.type} from ${invitation.sender}`} subheader={`${new Date(invitation.status_changed).toLocaleString()}`} />
        <Typography variant="body1" paragraph>  {invitation.message} </Typography>
        <Typography variant="subtitle1" gutterBottom> {invitation.status}</Typography>
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
            <>
                <Button variant="outlined" onClick={() => setStatus(APPEAL_STATUS.ACCEPTED)}>Accept</Button>
                <Button variant="outlined" onClick={() => setStatus(APPEAL_STATUS.REJECTED)}>Reject</Button>
            </>
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