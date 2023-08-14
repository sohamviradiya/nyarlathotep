"use client";
import GlobalContext from "@/components/global-context";
import { Contact } from "@/server/contact/contact.module";
import { Card, CardContent, Container, List, ListItem, Typography } from "@mui/material";
import Link from "next/link";
import { useState, useEffect } from "react";

function ContactListComponent() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    useEffect(() => {
        fetchContacts().then(contacts => setContacts(contacts));
    }, []);
    return (
        <Container maxWidth="xl" sx={{ padding: "6rem", minHeight: "80vh" }}>
            <List>
                {contacts.map(contact => (
                    <ListItem key={contact.id}>
                        <ContactComponent contact={contact} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

function ContactComponent({ contact }: { contact: Contact }) {
    const loggedInUserId = localStorage.getItem("email");
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5">
                    {loggedInUserId === contact.sender ? contact.receiver : contact.sender}
                </Typography>
                <Typography variant="subtitle1">
                    {new Date(contact.established).toLocaleString()}
                </Typography>
                <Link href={`/contact/${contact.id}`} color="primary">
                    View
                </Link>
            </CardContent>
        </Card>
    );
};

async function fetchContacts() {
    const response = await fetch('/api/contact',
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
    const data = await response.json();
    return data.payload.contacts;
};

export default function ContactList() {
    return (
        <GlobalContext>
            <ContactListComponent />
        </GlobalContext>
    );
};
