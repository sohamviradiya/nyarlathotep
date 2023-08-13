import { APPEAL_TYPE } from "@/server/appeal/appeal.module";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";

export default function CommunityRequestButton({ id, type }: { id: string, type: APPEAL_TYPE }) {
    const [isRequested, setIsRequested] = useState<boolean>(false);
    useEffect(() => {
        if (localStorage.getItem('email') == id)
            return;
        const request_id = `${localStorage.getItem('email')}~${id}.${type}`;
        fetchRequest(request_id).then((request) => {
            if (request)
                setIsRequested(true);
            else
                setIsRequested(false);
        });
    }, [id, type]);
    if (localStorage.getItem('email') == id) {
        return <></>;
    }
    if (isRequested) {
        return (<Button variant="contained" onClick={() => { withdrawRequest(id, type).then(() => { setIsRequested(false); }); }}>
            Withdraw Request
        </Button >);
    }
    else {
        return (<Button variant="contained" onClick={() => { sendRequest(id, type).then(() => { setIsRequested(true); }); }}>
            Request to {type}
        </Button>);
    }
}

async function fetchRequest(id: string) {
    const response = await fetch(`/api/appeal/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();
    if (!data?.payload?.appeal) return null;
    return data.payload.appeal;
}

async function sendRequest(id: string, type: APPEAL_TYPE) {
    const message = prompt("Please enter a message to send along with your request.");
    var response = null;
    if (type == "CONNECT") {
        response = await fetch(`/api/user/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ message }),
        });
    }
    else if (type == "JOIN") {
        response = await fetch(`/api/community/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ message }),
        });
    }
    else if (type == "MODERATE") {
        response = await fetch(`/api/community/${id}/role`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ message }),
        });
    }
    else {
        return null;
    }
    const data = await response.json();
    return data.payload.appeal;
}

async function withdrawRequest(id: string, type: APPEAL_TYPE) {
    const request_id = `${localStorage.getItem("email")}~${id}.${type}`;
    const response = await fetch(`/api/appeal/${request_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
    });
    if (response.ok)
        return true;
}

