import { useState } from "react";

export default function AnnouncementInput({ id }: { id: string }) {
    const [content, setContent] = useState("");
    return (
        <>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} />
            <button onClick={() => { sendAnnouncement(id, content).then(() => { setContent(""); }); }}>Send</button>
        </>
    );
};

async function sendAnnouncement(id: string, content: string) {
    const response = await fetch(`/api/community/${id}/announce`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content }),
    });
    const data = await response.json();
};


