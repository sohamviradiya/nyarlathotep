
import { Metadata } from "next";
import Logout from "@/components/auth/form.log-out";
export default function Home() {
    return (
        <main style={{ backgroundColor: "#202020", height: "100vh", display: "flex", gap: "20vh", flexDirection: "column", justifyContent: "top" }}>
            <h1 style={{ backgroundColor: "darkblue", padding: "2rem", width: "100%", textAlign: "center" }}>
                Log out
            </h1>
            <Logout />
        </main>
    )
}


export const metadata: Metadata = {
    title: "Log In",
    description: "Log In Page for NyarlaThotep",
};
