"use client";
import { useState, useEffect } from "react";
import { Contact } from "@/server/contact/contact.module";
import MessageComponent from "@/components/contact/message.contact";
import { MESSAGE_DIRECTION, MESSAGE_DIRECTION_TYPE } from "@/server/message/message.module";
import MessageInput from "@/components/contact/input.contact";
import ThemeHydrator from "@/components/mui/theme";
import { Container, Grid, List, ListItem, Typography } from "@mui/material";
import SkeletonBundle from "@/components/skeleton-bundle";

function ContactComponent({ params }: { params: { id: string } }) {
    const [contact, setContact] = useState<Contact | null>(null);
    useEffect(() => {
        fetchContact(params.id).then((contact) => setContact(contact));
    }, [params.id]);

    if (!contact)
        return <SkeletonBundle size={6} />;
    return (
        <Container maxWidth="xl">
            <Typography variant="h4">{contact.sender}</Typography>
            <Typography variant="h4">{contact.receiver}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Container sx={{ width: "100%" }}>
                        <Typography variant="h5">Incoming</Typography>
                        <MessageList
                            messages={contact.messages.incoming as string[]}
                            direction={MESSAGE_DIRECTION.INCOMING}
                        />
                    </Container>
                </Grid>
                <Grid item xs={6}>
                    <Container sx={{ width: "100%" }}>
                        <Typography variant="h5">Outgoing</Typography>
                        <MessageList
                            messages={contact.messages.outgoing as string[]}
                            direction={MESSAGE_DIRECTION.OUTGOING}
                        />
                    </Container>
                </Grid>
            </Grid>
            <MessageInput
                id={contact.id}
                reload={() => {
                    fetchContact(params.id).then((contact) => setContact(contact));
                }}
            />
        </Container>
    );
};

function MessageList({ messages, direction }: { messages: string[], direction: MESSAGE_DIRECTION_TYPE }) {
    return (
        <List>
            {messages.map((id) => (
                <ListItem key={id}>
                    <MessageComponent id={id} direction={direction} />
                </ListItem>
            ))}
        </List>
    )
};

async function fetchContact(id: string) {
    const response = await fetch(`/api/contact/${id}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
    const data = await response.json();
    return data.payload.contact;
}

export default function Contact({ params }: { params: { id: string } }) {
    return (
        <ThemeHydrator>
            <ContactComponent params={params} />
        </ThemeHydrator>
    );
}