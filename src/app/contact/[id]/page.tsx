"use client";
import { useState, useEffect } from "react";
import { Contact } from "@/server/contact/contact.module";
import MessageComponent from "@/components/message.contact";
export default function Contact({ params }: { params: { id: string } }) {
    const [contact, setContact] = useState<Contact | null>(null);
    useEffect(() => {
        fetchContact(params.id).then((contact) => setContact(contact));
    }, [params.id]);
    if (!contact) {
        return <div>Loading...</div>;
    }
    return (
        <div>
            <h1>{contact.sender}</h1>
            <h1>{contact.receiver}</h1>
            <div>
                <h2>Incoming</h2>
                <MessageList messages={contact.messages.incoming as string[]} />
            </div>
            <div>
                <h2>Outgoing</h2>
                <MessageList messages={contact.messages.outgoing as string[]} />
            </div>
        </div>
    );
};

function MessageList({ messages }: { messages: string[] }) {
    return (
        <div>
            {messages.map((id) => (<MessageComponent key={id} id={id} />))}
        </div>
    )
};

async function fetchContact(id: string) {
    const response = await fetch(`/api/contact/${id}`);
    const data = await response.json();
    return data.payload.contact;
}