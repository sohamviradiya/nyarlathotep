"use client";
import { useState, useEffect } from "react";
import { Contact } from "@/server/contact/contact.module";
import MessageComponent from "@/components/contact/message.contact";
import { MESSAGE_DIRECTION, MESSAGE_DIRECTION_TYPE } from "@/server/message/message.module";
import MessageInput from "@/components/contact/input.contact";
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
                <MessageList messages={contact.messages.incoming as string[]} direction={MESSAGE_DIRECTION.INCOMING} />
            </div>
            <div>
                <h2>Outgoing</h2>
                <MessageList messages={contact.messages.outgoing as string[]} direction={MESSAGE_DIRECTION.OUTGOING} />
            </div>
            <MessageInput id={contact.id} reload={() => fetchContact(params.id).then((contact) => setContact(contact))} />
        </div>
    );
};

function MessageList({ messages, direction }: { messages: string[], direction: MESSAGE_DIRECTION_TYPE }) {
    return (
        <div>
            {messages.map((id) => (<MessageComponent key={id} id={id} direction={direction} />))}
        </div>
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