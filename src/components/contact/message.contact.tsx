import { MESSAGE_DIRECTION, MESSAGE_DIRECTION_TYPE, MESSAGE_STATUS, MESSAGE_STATUS_TYPE, Message } from "@/server/message/message.module";
import { useState, useEffect } from "react";
import SkeletonBundle from "@/components/skeleton-bundle";
import { Box, Button, Typography } from "@mui/material";

export default function MessageComponent({ id, direction }: { id: string, direction: MESSAGE_DIRECTION_TYPE }): JSX.Element {
    const [message, setMessage] = useState<Message | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchMessage(id).then((message) => {
            if (!message) return;
            setMessage({ ...message, direction });
            setLoading(false);
        });
    }, [id, direction]);

    if (loading) return <SkeletonBundle size={1} />;
    if (!message?.content) return <></>;
    return (
        <Box>
            <Typography variant="h6">
                {message.direction === MESSAGE_DIRECTION.INCOMING && message.status === MESSAGE_STATUS.DRAFT ? "--Not Sent--" : message.content}
            </Typography>
            <Typography variant="subtitle1">
                {message.status} at {new Date(message.status_changed).toLocaleTimeString()}
            </Typography>
            <MessageActions {...message} setMessage={() => { setMessage({ ...message, direction }); }} />
        </Box>
    )
};

function MessageActions({ id, direction, status, content, setMessage: setMessage }: { id: string, direction: "INCOMING" | "OUTGOING", status: MESSAGE_STATUS_TYPE, content: string, setMessage: (message: Message) => void }): JSX.Element {
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
        else if (status == MESSAGE_STATUS.SENT) {
            markMessageRead(id).then((message) => {
                if (!message) return;
                setMessage(message);
            });
            return <></>;
        }
        else if (status == MESSAGE_STATUS.DRAFT)
            return <></>;
        else
            return <>Reload the Page</>;
    }
    else if (status == MESSAGE_STATUS.DRAFT) {
        return (
            <>
                <Button onClick={() => {
                    const newContent = prompt("Enter new content", content);
                    if (newContent != null && newContent != content)
                        editMessage(id, newContent).then((message) => {
                            if (!message) return;
                            setMessage(message);
                        });
                }}>Edit</Button>
                <Button onClick={() => {
                    deleteMessage(id).then(() => {
                        setMessage({} as Message);
                    })
                }}>Delete</Button>
                <Button onClick={() => {
                    sendMessage(id).then((message) => {
                        if (!message) return;
                        setMessage(message);
                    });
                }}>Send</Button>
            </>
        );
    }
    else
        return <></>;
};

function LikeButton({ id, setMessage, liked }: { id: string, setMessage: (message: Message) => void, liked: boolean }): JSX.Element {
    if (!liked)
        return (
            <Button onClick={() => {
                likeMessage(id).then((message) => {
                    if (!message) return;
                    setMessage(message);
                });
            }}>Like</Button>
        );
    else
        return (
            <Button onClick={() => {
                markMessageRead(id).then((message) => {
                    if (!message) return;
                    setMessage(message);
                });
            }}>Remove Like</Button>
        );
};

function DislikeButton({ id, setMessage, disliked }: { id: string, setMessage: (message: Message) => void, disliked: boolean }): JSX.Element {
    if (!disliked)
        return (
            <Button onClick={() => {
                dislikeMessage(id).then((message) => {
                    if (!message) return;
                    setMessage(message);
                });
            }}>Dislike</Button>
        );
    else
        return (
            <Button onClick={() => {
                markMessageRead(id).then((message) => {
                    if (!message) return;
                    setMessage(message);
                });
            }}>Remove Dislike</Button>
        );
};

async function fetchMessage(id: string) {
    const response = await fetch(`/api/message/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
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
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
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
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
};

async function sendMessage(id: string) {
    const response = await fetch(`/api/message/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: MESSAGE_STATUS.SENT })
    });
    const data = await response.json();
    if (!data?.payload) {
        return;
    }
    else
        return data.payload.message as Message;
};

async function markMessageRead(id: string) {
    const response = await fetch(`/api/message/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
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
    const response = await fetch(`/api/message/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
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
    const response = await fetch(`/api/message/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
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
