"use client";
import { useState, useEffect } from "react";
import { Contact } from "@/server/contact/contact.module";
import MessageComponent from "@/components/contact/message.contact";
import { MESSAGE_DIRECTION_TYPE } from "@/server/message/message.module";
import MessageInput from "@/components/contact/input.contact";
export default function Contact({ params }: { params: { id: string } }) {
    const [contact, setContact] = useState<Contact | null>(null);
    const [direction, setDirection] = useState<MESSAGE_DIRECTION_TYPE>("INCOMING");
    useEffect(() => {
        fetchContact(params.id).then((contact) => setContact(contact));
    }, [params.id]);
    useEffect(() => {
        if (!contact) return;
        const email = localStorage.getItem("email");
        if (email === contact.sender)
            setDirection("OUTGOING");
        else
            setDirection("INCOMING");
    }, [contact]);

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
            <MessageInput id={contact.id} reload={() => fetchContact(params.id).then((contact) => setContact(contact))} />
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