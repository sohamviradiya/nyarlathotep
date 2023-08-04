"use client";
import { useEffect, useState } from "react";

export default function RequestButton({ id }: { id: string }) {
    const [isRequested, setIsRequested] = useState<boolean>(false);
    useEffect(() => {
        const request_id = `${localStorage.getItem('id')}~${id}`;
        fetchRequest(request_id).then((request) => {
            if (request)
                setIsRequested(true);
            else
                setIsRequested(false);
        });
    }, [id]);
    if (isRequested) {
        return (<button style={{ backgroundColor: "darkblue", padding: "2rem", width: "50%" }} onClick={() => { withdrawRequest(id).then(() => { setIsRequested(false); }); }}>
            Withdraw Request
        </button >);
    }
    else {
        return (<button style={{ backgroundColor: "darkblue", padding: "2rem", width: "50%" }} onClick={() => { sendRequest(id).then(() => { setIsRequested(true); }); }}>
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

async function sendRequest(id: string) {
    const message = prompt("Please enter a message to send along with your request.");
    const response = await fetch(`/api/user/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message }),
    });
    const data = await response.json();
    console.log(data);
    return data.payload.appeal;
}

async function withdrawRequest(id: string) {
    const request_id = `${localStorage.getItem("email")}~${id}`;
    console.log(request_id);
    const response = await fetch(`/api/appeal/${request_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
    });
    const data = await response.json();
    if (response.ok)
        return true;
}

