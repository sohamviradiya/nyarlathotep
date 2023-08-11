import { useState, useEffect } from "react";

export default function MessageInput({ id, reload }: { id: string, reload: () => void }) {
    const [content, setContent] = useState("");
    return (
        <>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} />
            <button onClick={() => sendMessage(id, content, reload)}>Send</button>
        </>
    );
};

async function sendMessage(id: string, content: string, reload: () => void) {
    const response = await fetch(`/api/contact/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content }),
    });
    const data = await response.json();
    reload();
};


