"use client";
import { useState, useEffect } from "react";
import { Appeal } from "@/server/appeal/appeal.module";

export default function AppealList({ appeals }: { appeals: string[] }) {
    return (<>
        <ul>
            {appeals.map((appeal) => <li key={appeal}><Appeal id={appeal} /></li>)}
        </ul>
    </>);
}

function Appeal({ id }: { id: string }) {
    const [appeal, setAppeal] = useState<Appeal | null>(null);
    const [withdrawn, setWithdrawn] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('token') as string;
        fetchAppeal(id, token).then((appeal) => {
            setAppeal(appeal);
        }).catch((err) => {
            console.error(err);
        });
    }, [id]);
    return (
        (appeal && !withdrawn) ? (
            <>
                <h4>{appeal.receiver}</h4>
                <p>{appeal.message}</p>
                <h5>{appeal.status}</h5>
                <h6>{new Date(appeal.status_changed).toLocaleString()}</h6>
                <button onClick={() => {
                    withdrawAppeal(id, localStorage.getItem('token') as string).then(() => {
                        setWithdrawn(true);
                    })
                }}> Remove </button>
            </>) :
            (<></>)
    );
}

async function fetchAppeal(id: string, token: string) {
    const res = await fetch(`/api/appeal/${id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!data.payload) throw new Error(data.message);
    return data.payload.appeal;
}

async function withdrawAppeal(id: string, token: string) {
    const res = await fetch(`/api/appeal/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    return null;
}