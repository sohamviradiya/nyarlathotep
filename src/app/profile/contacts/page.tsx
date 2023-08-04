"use client";
import { Contact } from "@/server/contact/contact.module";
import Link from "next/link";
import { useState, useEffect } from "react";
export default function ContactList() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    useEffect(() => {
        fetchContacts().then(contacts => setContacts(contacts));
    }, []);
    return (
        <>
            <ul>
                {contacts.map(contact => (
                    <ContactComponent key={contact.id} contact={contact} id={localStorage.getItem("email") || ""} />
                ))}
            </ul>
        </>
    );
};

function ContactComponent({ contact, id }: { contact: Contact, id: string }) {
    return (
        <li>
            <h3>{id == contact.sender ? contact.receiver : contact.sender}</h3>
            <h4>{new Date(contact.established).toLocaleDateString()}</h4>
            <Link href={`/contacts/${contact.id}`}> View </Link>
        </li>
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