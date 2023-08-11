"use client";
import { useRouter } from "next/navigation";
import { Metadata } from "next";

export default function Logout() {
    const router = useRouter();
    return (
        <div>
            <h1>Are you sure you want to log out?</h1>
            <button onClick={() => {
                localStorage.removeItem("email");
                localStorage.removeItem("token");
                router.push("/");
            }}>Yes</button>
            <button onClick={() => {
                router.push("/");
            }}>No</button>
        </div>
    )
};

export const metadata: Metadata = {
    title: "Log Out",
    description: "Log Out Page for NyarlaThotep",
};

