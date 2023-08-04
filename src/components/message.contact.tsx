"use client";

import { MESSAGE_DIRECTION, MESSAGE_STATUS, MESSAGE_STATUS_TYPE, Message } from "@/server/message/message.module";
import { useState, useEffect, lazy } from "react";
import SkeletonBundle from "@/components/skeleton-bundle";

export default function MessageComponent({ id }: { id: string }) {
    const [message, setMessage] = useState<Message | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchMessage(id).then((message) => {
            if (!message) return;
            setMessage(message);
            setLoading(false);
        });
    }, [id]);
    if (loading) return <SkeletonBundle size={1} />;
    if (!message?.content) return <></>;
    return (
        <div style={{ alignSelf: `${message.direction == MESSAGE_DIRECTION.INCOMING ? 'start' : 'end'}` }}>
            <h4> {message.direction == MESSAGE_DIRECTION.INCOMING && message.status == MESSAGE_STATUS.DRAFT ? "--Not Sent--" : message.content}</h4>
            <h5> {message.status} at {new Date(message.status_changed).toLocaleTimeString()}</h5>
            <MessageActions {...message} setMessage={setMessage} />
        </div>
    )
};

function MessageActions({ id, direction, status, content, setMessage }: { id: string, direction: "INCOMING" | "OUTGOING", status: MESSAGE_STATUS_TYPE, content: string, setMessage: (message: Message) => void }) {
    if (direction == MESSAGE_DIRECTION.INCOMING) {
        if (status == MESSAGE_STATUS.READ)
            return (
                <>
                    <LikeButton setMessage={setMessage} id={id} liked={false} />
                    <DislikeButton setMessage={setMessage} id={id} disliked={false} />
                </>
            );
        else if (status == MESSAGE_STATUS.APPROVED)
            return (
                <>
                    <LikeButton setMessage={setMessage} id={id} liked={true} />
                    <DislikeButton setMessage={setMessage} id={id} disliked={false} />
                </>
            );
        else if (status == MESSAGE_STATUS.REJECTED)
            return (
                <>
                    <LikeButton setMessage={setMessage} id={id} liked={false} />
                    <DislikeButton setMessage={setMessage} id={id} disliked={true} />
                </>
            );
        else
            return <></>;
    }
    else if (status != MESSAGE_STATUS.APPROVED && status != MESSAGE_STATUS.REJECTED && status != MESSAGE_STATUS.READ) {
        return (
            <>
                <button onClick={() => {
                    const newContent = prompt("Enter new content", content);
                    if (newContent != null && newContent != content)
                        editMessage(id, newContent).then((message) => {
                            if (!message) return;
                            setMessage(message);
                        });
                }}>Edit</button>
                <button onClick={() => {
                    deleteMessage(id).then(() => {
                        setMessage({} as Message);
                    })
                }}>Delete</button>
                <button onClick={() => {
                    sendMessage(id).then((message) => {
                        if (!message) return;
                        setMessage(message);
                    });
                }}>Send</button>
            </>
        );
    }
    else
        return <></>;
};

function LikeButton({ id, setMessage, liked }: { id: string, setMessage: (message: Message) => void, liked: boolean }) {
    if (liked)
        return (
            <button onClick={() => {
                likeMessage(id).then((message) => {
                    if (!message) return;
                    setMessage(message);
                });
            }}>Like</button>
        );
    else
        return (
            <button onClick={() => {
                markMessageRead(id).then((message) => {
                    if (!message) return;
                    setMessage(message);
                });
            }}>Remove Like</button>
        );
};

function DislikeButton({ id, setMessage, disliked }: { id: string, setMessage: (message: Message) => void, disliked: boolean }) {
    if (disliked)
        return (
            <button onClick={() => {
                dislikeMessage(id).then((message) => {
                    if (!message) return;
                    setMessage(message);
                });
            }}>Dislike</button>
        );
    else
        <button onClick={() => {
            markMessageRead(id).then((message) => {
                if (!message) return;
                setMessage(message);
            });
        }}>Remove Dislike</button>
};

async function fetchMessage(id: string) {
    const response = await fetch(`/api/message/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
    if (!data?.payload) {
        console.error(data);
        return;
    }
    else {
        return data.payload.message as Message;
    }
};

async function editMessage(id: string, content: string) {
    const response = await fetch(`/api/message/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: content })
    });
    const data = await response.json();
    if (!data?.payload) {
        console.error(data);
        return;
    }
    else
        return data.payload.message as Message;

};

async function deleteMessage(id: string) {
    const response = await fetch(`/api/message/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
};

async function sendMessage(id: string) {
    const response = await fetch(`/api/message/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: MESSAGE_STATUS.SENT })
    });
    const data = await response.json();
    if (!data?.payload) {
        console.error(data);
        return;
    }
    else
        return data.payload.message as Message;
};

async function markMessageRead(id: string) {
    const response = await fetch(`/api/message/${id}/read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: MESSAGE_STATUS.READ })
    });
    const data = await response.json();
    if (!data?.payload) {
        console.error(data);
        return;
    }
    else
        return data.payload.message as Message;

};

async function likeMessage(id: string) {
    const response = await fetch(`/api/message/${id}/read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: MESSAGE_STATUS.APPROVED })
    });
    const data = await response.json();
    if (!data?.payload) {
        console.error(data);
        return;
    }
    else
        return data.payload.message as Message;
};

async function dislikeMessage(id: string) {
    const response = await fetch(`/api/message/${id}/read`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: MESSAGE_STATUS.REJECTED })
    });
    const data = await response.json();
    if (!data?.payload) {
        console.error(data);
        return;
    }
    else
        return data.payload.message as Message;
};
