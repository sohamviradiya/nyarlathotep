"use client";
import { APPEAL_TYPE, APPEAL_TYPE_ENUM } from "@/server/appeal/appeal.module";
import { useEffect, useState } from "react";

export default function CommunityRequestButton({ id, type }: { id: string, type: APPEAL_TYPE }) {
    const [isRequested, setIsRequested] = useState<boolean>(false);
    useEffect(() => {
        const request_id = `${localStorage.getItem('email')}~${id}`;
        fetchRequest(request_id).then((request) => {
            if (request)
                setIsRequested(true);
            else
                setIsRequested(false);
        });
    }, [id]);
    if (localStorage.getItem('email') == id) {
        return <></>;
    }
    if (isRequested) {
        return (<button style={{ backgroundColor: "darkblue", padding: "2rem", width: "50%" }} onClick={() => { withdrawRequest(id).then(() => { setIsRequested(false); }); }}>
            Withdraw Request
        </button >);
    }
    else {
        return (<button style={{ backgroundColor: "darkblue", padding: "2rem", width: "50%" }} onClick={() => { sendRequest(id, type).then(() => { setIsRequested(true); }); }}>
            Request
        </button>);
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

async function withdrawRequest(id: string) {
    const request_id = `${localStorage.getItem("email")}~${id}`;
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

