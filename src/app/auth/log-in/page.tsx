import Login from "@/components/auth/form.log-in";
import { Metadata } from "next";

export default function Home() {
    return (
        <main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "20vh", flexDirection: "column", justifyContent: "top" }}>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Log in
            </h1>
            <Login />
        </main>
    )
}


export const metadata: Metadata = {
    title: "Log In",
    description: "Log In Page for NyarlaThotep",
};
