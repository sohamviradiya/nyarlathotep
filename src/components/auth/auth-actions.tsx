import Link from "next/link";
import { useState, useEffect } from "react";

export function AuthActions() {
    const [user, setUser] = useState<string>("");
    useEffect(() => {
        console.log(localStorage.getItem("email") || "");
        setUser(localStorage.getItem("email") || "");
    }, []);
    if (user) {
        return (
            <header>
                <Link href="/profile">Profile</Link>
                <Link href="/auth/log-out">Logout</Link>
            </header>
        );
    }
    else {
        return (
            <header>
                <Link href="/auth/log-in">Login</Link>
                <Link href="/auth/sign-up">Sign Up</Link>
            </header>
        );
    }
}
;
