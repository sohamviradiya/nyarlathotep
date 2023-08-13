import { Button, FormControl, Input, InputLabel, TextField } from "@mui/material";
import { useState, useEffect } from "react";

export default function MessageInput({ id, reload }: { id: string, reload: () => void }) {
    const [content, setContent] = useState("");
    return (
        <FormControl sx={{ width: "100%", display: "flex" , flexDirection: "row" }}>
            <TextField label="Add Message" multiline maxRows={4}variant="filled" value={content} onChange={(e) => setContent(e.target.value)}/>
            <Button variant="outlined" onClick={() => sendMessage(id, content, reload)}>Send</Button>
        </FormControl>
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
    reload();
};


