import { Button, Grid, TextField } from "@mui/material";
import { useState } from "react";

export default function AnnouncementInput({ id }: { id: string }) {
    const [content, setContent] = useState("");
    return (
        <Grid container spacing={2} alignItems="center" padding="1rem">
            <Grid item xs={9}>
                <TextField type="text" fullWidth variant="outlined" label="Announcement Content" value={content} onChange={(e) => setContent(e.target.value)} />
            </Grid>
            <Grid item xs={3}>
                <Button onClick={() => { sendAnnouncement(id, content).then(() => { setContent(""); }); }}>Send</Button>
            </Grid>
        </Grid>
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


